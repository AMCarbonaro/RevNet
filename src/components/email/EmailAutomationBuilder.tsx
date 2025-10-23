'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Workflow, 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Trash2, 
  Edit, 
  Eye,
  Clock,
  Mail,
  Users,
  Target,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Branch,
  Timer,
  Send,
  Save
} from 'lucide-react';
import { emailAutomationManager } from '@/lib/email-automation';

interface EmailAutomationBuilderProps {
  automationId?: string;
  onSave?: (automation: any) => void;
  onCancel?: () => void;
}

interface AutomationStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  name: string;
  description: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface AutomationTrigger {
  type: 'event' | 'schedule' | 'condition';
  event?: string;
  condition?: Record<string, any>;
  schedule?: string;
}

const EmailAutomationBuilder: React.FC<EmailAutomationBuilderProps> = ({
  automationId,
  onSave,
  onCancel
}) => {
  const [automation, setAutomation] = useState({
    name: '',
    description: '',
    trigger: {
      type: 'event' as 'event' | 'schedule' | 'condition',
      event: 'user_signup',
      condition: {},
      schedule: ''
    },
    actions: [] as Array<{
      type: 'send_email' | 'wait' | 'condition';
      templateId?: string;
      delay?: number;
      condition?: Record<string, any>;
    }>,
    status: 'draft' as 'active' | 'inactive' | 'draft'
  });

  const [steps, setSteps] = useState<AutomationStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<AutomationStep | null>(null);
  const [showStepEditor, setShowStepEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const availableTriggers = [
    { type: 'event', name: 'User Signup', description: 'Triggered when a user signs up' },
    { type: 'event', name: 'Project Created', description: 'Triggered when a project is created' },
    { type: 'event', name: 'Donation Made', description: 'Triggered when a donation is made' },
    { type: 'event', name: 'Letter Completed', description: 'Triggered when a letter is completed' },
    { type: 'schedule', name: 'Daily', description: 'Triggered daily at a specific time' },
    { type: 'schedule', name: 'Weekly', description: 'Triggered weekly' },
    { type: 'schedule', name: 'Monthly', description: 'Triggered monthly' }
  ];

  const availableActions = [
    { type: 'send_email', name: 'Send Email', description: 'Send an email to the user' },
    { type: 'wait', name: 'Wait', description: 'Wait for a specified time' },
    { type: 'condition', name: 'Condition', description: 'Check a condition and branch accordingly' }
  ];

  const availableTemplates = emailAutomationManager.getAllTemplates();

  useEffect(() => {
    if (automationId) {
      loadAutomation(automationId);
    } else {
      initializeDefaultSteps();
    }
  }, [automationId]);

  const loadAutomation = async (id: string) => {
    try {
      const existingAutomation = emailAutomationManager.getAutomation(id);
      if (existingAutomation) {
        setAutomation(existingAutomation);
        // Convert automation to steps for visualization
        convertAutomationToSteps(existingAutomation);
      }
    } catch (error) {
      setError('Failed to load automation');
    }
  };

  const initializeDefaultSteps = () => {
    const defaultSteps: AutomationStep[] = [
      {
        id: 'trigger-1',
        type: 'trigger',
        name: 'User Signup',
        description: 'Triggered when a user signs up',
        config: { event: 'user_signup' },
        position: { x: 100, y: 100 }
      }
    ];
    setSteps(defaultSteps);
  };

  const convertAutomationToSteps = (automationData: any) => {
    const automationSteps: AutomationStep[] = [];
    
    // Add trigger step
    automationSteps.push({
      id: 'trigger-1',
      type: 'trigger',
      name: automationData.trigger.type === 'event' ? 'Event Trigger' : 'Schedule Trigger',
      description: automationData.trigger.event || automationData.trigger.schedule || 'Custom trigger',
      config: automationData.trigger,
      position: { x: 100, y: 100 }
    });

    // Add action steps
    automationData.actions.forEach((action: any, index: number) => {
      automationSteps.push({
        id: `action-${index + 1}`,
        type: action.type === 'send_email' ? 'action' : action.type,
        name: action.type === 'send_email' ? 'Send Email' : action.type === 'wait' ? 'Wait' : 'Condition',
        description: action.type === 'send_email' ? 'Send email to user' : action.type === 'wait' ? `Wait ${action.delay}ms` : 'Check condition',
        config: action,
        position: { x: 100, y: 200 + (index * 150) }
      });
    });

    setSteps(automationSteps);
  };

  const addStep = (type: 'trigger' | 'action' | 'condition' | 'delay') => {
    const newStep: AutomationStep = {
      id: `${type}-${Date.now()}`,
      type,
      name: type === 'trigger' ? 'New Trigger' : type === 'action' ? 'New Action' : type === 'condition' ? 'New Condition' : 'New Delay',
      description: `New ${type} step`,
      config: {},
      position: { x: 100 + (steps.length * 50), y: 100 + (steps.length * 50) }
    };

    setSteps([...steps, newStep]);
    setSelectedStep(newStep);
    setShowStepEditor(true);
  };

  const updateStep = (stepId: string, updates: Partial<AutomationStep>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
    
    if (selectedStep?.id === stepId) {
      setSelectedStep({ ...selectedStep, ...updates });
    }
  };

  const deleteStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
      setShowStepEditor(false);
    }
  };

  const saveAutomation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Convert steps back to automation format
      const triggerStep = steps.find(step => step.type === 'trigger');
      const actionSteps = steps.filter(step => step.type !== 'trigger');

      const automationData = {
        ...automation,
        trigger: triggerStep?.config || automation.trigger,
        actions: actionSteps.map(step => step.config)
      };

      if (automationId) {
        // Update existing automation
        emailAutomationManager.updateAutomation(automationId, automationData);
      } else {
        // Create new automation
        emailAutomationManager.createAutomation(automationData);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onSave?.(automationData);
    } catch (error) {
      setError('Failed to save automation');
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'trigger': return <Play className="h-4 w-4" />;
      case 'action': return <Send className="h-4 w-4" />;
      case 'condition': return <Branch className="h-4 w-4" />;
      case 'delay': return <Timer className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'trigger': return 'bg-terminal-green';
      case 'action': return 'bg-terminal-blue';
      case 'condition': return 'bg-terminal-purple';
      case 'delay': return 'bg-terminal-yellow';
      default: return 'bg-matrix-dark';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-terminal-cyan neon-glow">
          {automationId ? 'Edit Email Automation' : 'Create Email Automation'}
        </h1>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={onCancel}
            variant="outline"
            className="border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan hover:text-black"
          >
            Cancel
          </Button>
          <Button 
            onClick={saveAutomation}
            disabled={loading}
            className="btn-neon bg-terminal-green border-terminal-green hover:bg-terminal-green hover:text-black"
          >
            {loading ? (
              <>
                <Settings className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Automation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="bg-terminal-green/20 border-terminal-green">
          <CheckCircle className="h-4 w-4 text-terminal-green" />
          <AlertDescription className="text-terminal-green">
            Automation saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert className="bg-terminal-red/20 border-terminal-red">
          <AlertTriangle className="h-4 w-4 text-terminal-red" />
          <AlertDescription className="text-terminal-red">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Automation Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="terminal-card">
            <CardHeader>
              <CardTitle className="text-lg text-terminal-cyan flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Automation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-terminal-green mb-2">
                  Automation Name
                </label>
                <Input
                  value={automation.name}
                  onChange={(e) => setAutomation({ ...automation, name: e.target.value })}
                  placeholder="Enter automation name"
                  className="bg-matrix-darker border-matrix-dark text-terminal-cyan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-terminal-green mb-2">
                  Description
                </label>
                <Textarea
                  value={automation.description}
                  onChange={(e) => setAutomation({ ...automation, description: e.target.value })}
                  placeholder="Enter automation description"
                  rows={3}
                  className="bg-matrix-darker border-matrix-dark text-terminal-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-terminal-green mb-2">
                    Status
                  </label>
                  <select
                    value={automation.status}
                    onChange={(e) => setAutomation({ ...automation, status: e.target.value as any })}
                    className="w-full p-2 bg-matrix-darker border border-matrix-dark text-terminal-cyan rounded"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Builder */}
          <Card className="terminal-card">
            <CardHeader>
              <CardTitle className="text-lg text-terminal-cyan flex items-center">
                <Workflow className="h-5 w-5 mr-2" />
                Workflow Builder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-96 bg-matrix-darker rounded-lg p-4 relative">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`absolute ${getStepColor(step.type)} p-4 rounded-lg cursor-pointer border-2 ${
                      selectedStep?.id === step.id ? 'border-terminal-cyan' : 'border-transparent'
                    }`}
                    style={{
                      left: step.position.x,
                      top: step.position.y,
                      width: 200,
                      height: 80
                    }}
                    onClick={() => {
                      setSelectedStep(step);
                      setShowStepEditor(true);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      {getStepIcon(step.type)}
                      <span className="text-sm font-semibold text-black">{step.name}</span>
                    </div>
                    <div className="text-xs text-black mt-1">{step.description}</div>
                    {index < steps.length - 1 && (
                      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                        <ArrowRight className="h-4 w-4 text-terminal-cyan" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Step Editor and Actions */}
        <div className="space-y-6">
          {/* Add Steps */}
          <Card className="terminal-card">
            <CardHeader>
              <CardTitle className="text-lg text-terminal-cyan flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => addStep('trigger')}
                className="w-full btn-neon bg-terminal-green border-terminal-green hover:bg-terminal-green hover:text-black"
              >
                <Play className="h-4 w-4 mr-2" />
                Add Trigger
              </Button>
              <Button
                onClick={() => addStep('action')}
                className="w-full btn-neon bg-terminal-blue border-terminal-blue hover:bg-terminal-blue hover:text-black"
              >
                <Send className="h-4 w-4 mr-2" />
                Add Action
              </Button>
              <Button
                onClick={() => addStep('condition')}
                className="w-full btn-neon bg-terminal-purple border-terminal-purple hover:bg-terminal-purple hover:text-black"
              >
                <Branch className="h-4 w-4 mr-2" />
                Add Condition
              </Button>
              <Button
                onClick={() => addStep('delay')}
                className="w-full btn-neon bg-terminal-yellow border-terminal-yellow hover:bg-terminal-yellow hover:text-black"
              >
                <Timer className="h-4 w-4 mr-2" />
                Add Delay
              </Button>
            </CardContent>
          </Card>

          {/* Step Editor */}
          {showStepEditor && selectedStep && (
            <Card className="terminal-card">
              <CardHeader>
                <CardTitle className="text-lg text-terminal-cyan flex items-center">
                  <Edit className="h-5 w-5 mr-2" />
                  Edit Step
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-terminal-green mb-2">
                    Step Name
                  </label>
                  <Input
                    value={selectedStep.name}
                    onChange={(e) => updateStep(selectedStep.id, { name: e.target.value })}
                    className="bg-matrix-darker border-matrix-dark text-terminal-cyan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-terminal-green mb-2">
                    Description
                  </label>
                  <Textarea
                    value={selectedStep.description}
                    onChange={(e) => updateStep(selectedStep.id, { description: e.target.value })}
                    rows={2}
                    className="bg-matrix-darker border-matrix-dark text-terminal-cyan"
                  />
                </div>

                {selectedStep.type === 'action' && (
                  <div>
                    <label className="block text-sm font-medium text-terminal-green mb-2">
                      Email Template
                    </label>
                    <select
                      value={selectedStep.config.templateId || ''}
                      onChange={(e) => updateStep(selectedStep.id, { 
                        config: { ...selectedStep.config, templateId: e.target.value }
                      })}
                      className="w-full p-2 bg-matrix-darker border border-matrix-dark text-terminal-cyan rounded"
                    >
                      <option value="">Select a template</option>
                      {availableTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedStep.type === 'delay' && (
                  <div>
                    <label className="block text-sm font-medium text-terminal-green mb-2">
                      Delay (minutes)
                    </label>
                    <Input
                      type="number"
                      value={selectedStep.config.delay || 0}
                      onChange={(e) => updateStep(selectedStep.id, { 
                        config: { ...selectedStep.config, delay: parseInt(e.target.value) }
                      })}
                      className="bg-matrix-darker border-matrix-dark text-terminal-cyan"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setShowStepEditor(false)}
                    className="flex-1 btn-neon bg-terminal-green border-terminal-green hover:bg-terminal-green hover:text-black"
                  >
                    Save Step
                  </Button>
                  <Button
                    onClick={() => deleteStep(selectedStep.id)}
                    variant="outline"
                    className="border-terminal-red text-terminal-red hover:bg-terminal-red hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Automation Preview */}
          <Card className="terminal-card">
            <CardHeader>
              <CardTitle className="text-lg text-terminal-cyan flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Automation Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-2 p-2 bg-matrix-darker rounded">
                    <span className="text-terminal-cyan text-sm">{index + 1}.</span>
                    {getStepIcon(step.type)}
                    <span className="text-terminal-green text-sm">{step.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailAutomationBuilder;
