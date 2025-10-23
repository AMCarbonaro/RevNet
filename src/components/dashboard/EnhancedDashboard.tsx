'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Settings, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import AnalyticsDashboard from '@/components/widgets/AnalyticsDashboard';
import ActivityFeedWidget from '@/components/widgets/ActivityFeedWidget';
import OnlineUsersWidget from '@/components/widgets/OnlineUsersWidget';
import ProjectListWidget from '@/components/widgets/ProjectListWidget';

interface Widget {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  size: 'small' | 'medium' | 'large';
  position: number;
}

interface WidgetConfig {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  defaultSize: 'small' | 'medium' | 'large';
  category: string;
}

const availableWidgets: WidgetConfig[] = [
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    component: AnalyticsDashboard,
    defaultSize: 'large',
    category: 'Analytics'
  },
  {
    id: 'activity-feed',
    name: 'Activity Feed',
    component: ActivityFeedWidget,
    defaultSize: 'medium',
    category: 'Social'
  },
  {
    id: 'online-users',
    name: 'Online Users',
    component: OnlineUsersWidget,
    defaultSize: 'small',
    category: 'Social'
  },
  {
    id: 'project-list',
    name: 'Featured Projects',
    component: ProjectListWidget,
    defaultSize: 'medium',
    category: 'Projects'
  }
];

export default function EnhancedDashboard() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);

  useEffect(() => {
    loadDashboardConfig();
  }, []);

  const loadDashboardConfig = () => {
    const savedConfig = localStorage.getItem('dashboard-config');
    if (savedConfig) {
      setWidgets(JSON.parse(savedConfig));
    } else {
      // Default dashboard configuration
      setWidgets([
        { id: 'analytics', type: 'analytics', title: 'Analytics Dashboard', visible: true, size: 'large', position: 0 },
        { id: 'activity-feed', type: 'activity-feed', title: 'Activity Feed', visible: true, size: 'medium', position: 1 },
        { id: 'online-users', type: 'online-users', title: 'Online Users', visible: true, size: 'small', position: 2 },
        { id: 'project-list', type: 'project-list', title: 'Featured Projects', visible: true, size: 'medium', position: 3 }
      ]);
    }
  };

  const saveDashboardConfig = (newWidgets: Widget[]) => {
    localStorage.setItem('dashboard-config', JSON.stringify(newWidgets));
    setWidgets(newWidgets);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index
    }));

    saveDashboardConfig(updatedItems);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
    );
    saveDashboardConfig(updatedWidgets);
  };

  const removeWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter(widget => widget.id !== widgetId);
    saveDashboardConfig(updatedWidgets);
  };

  const addWidget = (widgetType: string) => {
    const widgetConfig = availableWidgets.find(w => w.id === widgetType);
    if (!widgetConfig) return;

    const newWidget: Widget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      title: widgetConfig.name,
      visible: true,
      size: widgetConfig.defaultSize,
      position: widgets.length
    };

    const updatedWidgets = [...widgets, newWidget];
    saveDashboardConfig(updatedWidgets);
    setShowAddWidget(false);
  };

  const getWidgetSize = (size: string) => {
    switch (size) {
      case 'small': return 'lg:col-span-1';
      case 'medium': return 'lg:col-span-2';
      case 'large': return 'lg:col-span-3';
      default: return 'lg:col-span-2';
    }
  };

  const renderWidget = (widget: Widget) => {
    const widgetConfig = availableWidgets.find(w => w.id === widget.type);
    if (!widgetConfig) return null;

    const WidgetComponent = widgetConfig.component;
    return <WidgetComponent key={widget.id} />;
  };

  const visibleWidgets = widgets.filter(w => w.visible).sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-terminal-green neon-glow mb-2">
              Enhanced Dashboard
            </h1>
            <p className="text-terminal-cyan">
              Customize your revolutionary command center
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddWidget(!showAddWidget)}
              className="btn-neon flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Widget</span>
            </button>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 border rounded transition-colors ${
                isEditing
                  ? 'border-terminal-green bg-terminal-green text-black'
                  : 'border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan hover:text-black'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              {isEditing ? 'Done' : 'Edit'}
            </button>
          </div>
        </div>

        {/* Add Widget Panel */}
        {showAddWidget && (
          <div className="card-holographic p-6 mb-6">
            <h3 className="text-lg font-bold text-terminal-green mb-4">Add Widget</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableWidgets.map(widget => (
                <button
                  key={widget.id}
                  onClick={() => addWidget(widget.id)}
                  className="p-4 border border-terminal-green rounded hover:bg-terminal-green hover:text-black transition-colors text-left"
                >
                  <h4 className="font-semibold text-terminal-green">{widget.name}</h4>
                  <p className="text-terminal-cyan text-sm mt-1">{widget.category}</p>
                  <p className="text-terminal-cyan text-xs mt-2">
                    Size: {widget.defaultSize}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {visibleWidgets.map((widget, index) => (
                  <Draggable
                    key={widget.id}
                    draggableId={widget.id}
                    index={index}
                    isDragDisabled={!isEditing}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${getWidgetSize(widget.size)} ${
                          snapshot.isDragging ? 'opacity-50' : ''
                        } ${isEditing ? 'cursor-move' : ''}`}
                      >
                        <div className="relative">
                          {isEditing && (
                            <div className="absolute top-2 right-2 z-10 flex space-x-2">
                              <button
                                onClick={() => toggleWidgetVisibility(widget.id)}
                                className="p-1 bg-black/80 border border-terminal-green rounded hover:bg-terminal-green hover:text-black transition-colors"
                              >
                                {widget.visible ? (
                                  <Eye className="w-3 h-3 text-terminal-green" />
                                ) : (
                                  <EyeOff className="w-3 h-3 text-terminal-green" />
                                )}
                              </button>
                              
                              <button
                                onClick={() => removeWidget(widget.id)}
                                className="p-1 bg-black/80 border border-terminal-red rounded hover:bg-terminal-red hover:text-white transition-colors"
                              >
                                <Trash2 className="w-3 h-3 text-terminal-red" />
                              </button>
                            </div>
                          )}
                          
                          {isEditing && (
                            <div
                              {...provided.dragHandleProps}
                              className="absolute top-2 left-2 z-10 p-1 bg-black/80 border border-terminal-cyan rounded cursor-move"
                            >
                              <div className="w-3 h-3 text-terminal-cyan">⋮⋮</div>
                            </div>
                          )}
                          
                          {renderWidget(widget)}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Empty State */}
        {visibleWidgets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-terminal-cyan mb-2">
              No widgets visible
            </h3>
            <p className="text-terminal-green mb-6">
              Add some widgets to customize your dashboard
            </p>
            <button
              onClick={() => setShowAddWidget(true)}
              className="btn-neon"
            >
              Add Your First Widget
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
