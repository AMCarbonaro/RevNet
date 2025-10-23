import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import authService from '../services/auth';
import offlineService from '../services/offline';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  fundingGoal: number;
  currentFunding: number;
  deadline: string;
  creator: {
    name: string;
    avatar?: string;
  };
  isBookmarked: boolean;
  tags: string[];
}

interface ProjectsScreenProps {
  navigation: any;
}

const ProjectsScreen: React.FC<ProjectsScreenProps> = ({ navigation }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'my' | 'bookmarked'>('all');
  const [user, setUser] = useState(authService.getCurrentUser());

  // Create project form state
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    fundingGoal: '',
    deadline: '',
  });

  useEffect(() => {
    loadProjects();
    
    // Subscribe to auth state changes
    const authUnsubscribe = authService.subscribe((state) => {
      setUser(state.user);
    });

    return () => {
      authUnsubscribe();
    };
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      if (offlineService.isOnline()) {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
          return;
        }
      }
      
      // Fallback to offline storage
      const cachedProjects = await offlineService.getCachedData('projects');
      if (cachedProjects) {
        setProjects(cachedProjects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      Alert.alert('Error', 'Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleProjectPress = (project: Project) => {
    navigation.navigate('ProjectDetail', { projectId: project.id });
  };

  const handleCreateProject = async () => {
    if (!newProject.title || !newProject.description || !newProject.fundingGoal) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      const projectData = {
        ...newProject,
        fundingGoal: parseFloat(newProject.fundingGoal),
        deadline: newProject.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      if (offlineService.isOnline()) {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectData),
        });

        if (response.ok) {
          Alert.alert('Success', 'Project created successfully!');
          setShowCreateModal(false);
          setNewProject({ title: '', description: '', fundingGoal: '', deadline: '' });
          await loadProjects();
        } else {
          throw new Error('Failed to create project');
        }
      } else {
        // Queue for offline processing
        await offlineService.queueAction({
          type: 'CREATE_PROJECT',
          data: projectData,
        });
        Alert.alert('Success', 'Project will be created when you\'re back online!');
        setShowCreateModal(false);
        setNewProject({ title: '', description: '', fundingGoal: '', deadline: '' });
      }
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Error', 'Failed to create project. Please try again.');
    }
  };

  const handleBookmark = async (projectId: string, isBookmarked: boolean) => {
    try {
      const action = isBookmarked ? 'unbookmark' : 'bookmark';
      
      if (offlineService.isOnline()) {
        const response = await fetch(`/api/projects/${projectId}/bookmark`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        });

        if (response.ok) {
          setProjects(prev => prev.map(p => 
            p.id === projectId ? { ...p, isBookmarked: !isBookmarked } : p
          ));
        }
      } else {
        // Queue for offline processing
        await offlineService.queueAction({
          type: 'BOOKMARK_PROJECT',
          data: { projectId, action },
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const getFilteredProjects = () => {
    switch (filter) {
      case 'my':
        return projects.filter(p => p.creator.name === user?.name);
      case 'bookmarked':
        return projects.filter(p => p.isBookmarked);
      default:
        return projects;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#00ff88';
      case 'completed': return '#4ecdc4';
      case 'cancelled': return '#ff6b6b';
      default: return '#666666';
    }
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const renderProject = ({ item: project }: { item: Project }) => {
    const statusColor = getStatusColor(project.status);
    const progressPercentage = getProgressPercentage(project.currentFunding, project.fundingGoal);

    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => handleProjectPress(project)}
      >
        <LinearGradient
          colors={['#111111', '#000000']}
          style={styles.projectCardGradient}
        >
          <View style={styles.projectHeader}>
            <View style={styles.projectInfo}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text style={styles.projectCreator}>by {project.creator.name}</Text>
            </View>
            
            <TouchableOpacity
              onPress={() => handleBookmark(project.id, project.isBookmarked)}
            >
              <Icon
                name={project.isBookmarked ? "bookmark" : "bookmark-border"}
                size={24}
                color={project.isBookmarked ? "#00ff88" : "#666666"}
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.projectDescription} numberOfLines={2}>
            {project.description}
          </Text>
          
          <View style={styles.projectStats}>
            <View style={styles.statItem}>
              <Icon name="attach-money" size={16} color="#00ff88" />
              <Text style={styles.statText}>
                ${project.currentFunding.toLocaleString()} / ${project.fundingGoal.toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Icon name="schedule" size={16} color="#ff6b6b" />
              <Text style={styles.statText}>
                {new Date(project.deadline).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%`, backgroundColor: statusColor }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progressPercentage.toFixed(1)}% funded
            </Text>
          </View>
          
          <View style={styles.projectFooter}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {project.status.toUpperCase()}
              </Text>
            </View>
            
            {project.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {project.tags.slice(0, 2).map((tag, index) => (
                  <Text key={index} style={styles.tag}>
                    #{tag}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create New Project</Text>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <Icon name="close" size={24} color="#00ff88" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.modalContent}>
          <TextInput
            style={styles.input}
            placeholder="Project Title"
            placeholderTextColor="#666666"
            value={newProject.title}
            onChangeText={(text) => setNewProject(prev => ({ ...prev, title: text }))}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Project Description"
            placeholderTextColor="#666666"
            value={newProject.description}
            onChangeText={(text) => setNewProject(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Funding Goal ($)"
            placeholderTextColor="#666666"
            value={newProject.fundingGoal}
            onChangeText={(text) => setNewProject(prev => ({ ...prev, fundingGoal: text }))}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Deadline (YYYY-MM-DD)"
            placeholderTextColor="#666666"
            value={newProject.deadline}
            onChangeText={(text) => setNewProject(prev => ({ ...prev, deadline: text }))}
          />
        </View>
        
        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowCreateModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateProject}
          >
            <Text style={styles.createButtonText}>Create Project</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const filteredProjects = getFilteredProjects();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="work" size={48} color="#00ff88" />
        <Text style={styles.loadingText}>Loading Projects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Filters */}
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          {(['all', 'my', 'bookmarked'] as const).map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterButton,
                filter === filterType && styles.activeFilterButton,
              ]}
              onPress={() => setFilter(filterType)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === filterType && styles.activeFilterButtonText,
                ]}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Icon name="add" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProjects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00ff88"
            colors={['#00ff88']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {renderCreateModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#00ff88',
    fontSize: 16,
    fontFamily: 'monospace',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#00ff8820',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeFilterButton: {
    backgroundColor: '#00ff88',
  },
  filterButtonText: {
    color: '#666666',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  activeFilterButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00ff88',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  projectCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  projectCardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#00ff8820',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  projectCreator: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: '#cccccc',
    fontFamily: 'monospace',
    lineHeight: 20,
    marginBottom: 16,
  },
  projectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
    marginLeft: 4,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333333',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#00ff88',
    fontFamily: 'monospace',
    textAlign: 'right',
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tag: {
    fontSize: 10,
    color: '#00ff88',
    fontFamily: 'monospace',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#00ff8820',
  },
  modalTitle: {
    fontSize: 20,
    color: '#00ff88',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  input: {
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#00ff8820',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#00ff8820',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ff88',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#00ff88',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  createButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
});

export default ProjectsScreen;
