'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Eye, 
  Code, 
  Send, 
  Settings, 
  Plus, 
  Trash2, 
  Edit,
  Copy,
  Download,
  Upload,
  Palette,
  Type,
  Image,
  Link,
  Table,
  List,
  Quote
} from 'lucide-react';
import { emailAutomationManager } from '@/lib/email-automation';

interface EmailTemplateEditorProps {
  templateId?: string;
  onSave?: (template: any) => void;
  onCancel?: () => void;
}

interface TemplateVariable {
  name: string;
  description: string;
  example: string;
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  templateId,
  onSave,
  onCancel
}) => {
  const [template, setTemplate] = useState({
    name: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    category: 'transactional' as 'transactional' | 'marketing' | 'notification' | 'system',
    status: 'draft' as 'active' | 'inactive' | 'draft'
  });
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [previewMode, setPreviewMode] = useState<'html' | 'text'>('html');
  const [previewData, setPreviewData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const availableVariables: TemplateVariable[] = [
    { name: 'userName', description: 'User\'s full name', example: 'John Doe' },
    { name: 'userEmail', description: 'User\'s email address', example: 'john@example.com' },
    { name: 'projectTitle', description: 'Project title', example: 'Revolutionary App' },
    { name: 'projectUrl', description: 'Project URL', example: 'https://revolutionnetwork.com/project/123' },
    { name: 'amount', description: 'Donation amount', example: '$50.00' },
    { name: 'transactionId', description: 'Transaction ID', example: 'TXN_123456' },
    { name: 'loginUrl', description: 'Login URL', example: 'https://revolutionnetwork.com/login' },
    { name: 'unsubscribeUrl', description: 'Unsubscribe URL', example: 'https://revolutionnetwork.com/unsubscribe' },
    { name: 'date', description: 'Current date', example: 'January 15, 2024' },
    { name: 'time', description: 'Current time', example: '2:30 PM' }
  ];

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  const loadTemplate = async (id: string) => {
    try {
      const existingTemplate = emailAutomationManager.getTemplate(id);
      if (existingTemplate) {
        setTemplate({
          name: existingTemplate.name,
          subject: existingTemplate.subject,
          htmlContent: existingTemplate.htmlContent,
          textContent: existingTemplate.textContent,
          category: existingTemplate.category,
          status: existingTemplate.status
        });
        setVariables(existingTemplate.variables.map(v => 
          availableVariables.find(av => av.name === v) || 
          { name: v, description: 'Custom variable', example: 'example' }
        ));
      }
    } catch (error) {
      setError('Failed to load template');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const templateData = {
        ...template,
        variables: variables.map(v => v.name)
      };

      if (templateId) {
        emailAutomationManager.updateTemplate(templateId, templateData);
      } else {
        emailAutomationManager.createTemplate(templateData);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onSave?.(templateData);
    } catch (error) {
      setError('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const addVariable = (variable: TemplateVariable) => {
    if (!variables.find(v => v.name === variable.name)) {
      setVariables([...variables, variable]);
    }
  };

  const removeVariable = (variableName: string) => {
    setVariables(variables.filter(v => v.name !== variableName));
  };

  const insertVariable = (variableName: string) => {
    const textarea = document.getElementById('htmlContent') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newText = before + `{{${variableName}}}` + after;
      
      setTemplate({ ...template, htmlContent: newText });
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variableName.length + 4, start + variableName.length + 4);
      }, 0);
    }
  };

  const generatePreview = () => {
    const previewVariables: Record<string, any> = {};
    variables.forEach(variable => {
      previewVariables[variable.name] = variable.example;
    });
    setPreviewData(previewVariables);
  };

  const processTemplate = (content: string, variables: Record<string, any>): string => {
    let processed = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    });
    return processed;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const downloadTemplate = () => {
    const content = `Email Template: ${template.name}

Subject: ${template.subject}

HTML Content:
${template.htmlContent}

Text Content:
${template.textContent}

Variables: ${variables.map(v => v.name).join(', ')}

Generated: ${new Date().toLocaleString()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}-template.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-terminal-cyan neon-glow">
          {templateId ? 'Edit Email Template' : 'Create Email Template'}
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
            onClick={handleSave}
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
                Save Template
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="bg-terminal-green/20 border-terminal-green">
          <AlertDescription className="text-terminal-green">
            Template saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert className="bg-terminal-red/20 border-terminal-red">
          <AlertDescription className="text-terminal-red">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="terminal-card">
            <CardHeader>
              <CardTitle className="text-lg text-terminal-cyan flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Template Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-terminal-green mb-2">
                  Template Name
                </label>
                <Input
                  value={template.name}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                  placeholder="Enter template name"
                  className="bg-matrix-darker border-matrix-dark text-terminal-cyan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-terminal-green mb-2">
                  Subject Line
                </label>
                <Input
                  value={template.subject}
                  onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                  placeholder="Enter email subject"
                  className="bg-matrix-darker border-matrix-dark text-terminal-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-terminal-green mb-2">
                    Category
                  </label>
                  <select
                    value={template.category}
                    onChange={(e) => setTemplate({ ...template, category: e.target.value as any })}
                    className="w-full p-2 bg-matrix-darker border border-matrix-dark text-terminal-cyan rounded"
                  >
                    <option value="transactional">Transactional</option>
                    <option value="marketing">Marketing</option>
                    <option value="notification">Notification</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-terminal-green mb-2">
                    Status
                  </label>
                  <select
                    value={template.status}
                    onChange={(e) => setTemplate({ ...template, status: e.target.value as any })}
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

          {/* HTML Content Editor */}
          <Card className="terminal-card">
            <CardHeader>
              <CardTitle className="text-lg text-terminal-cyan flex items-center">
                <Code className="h-5 w-5 mr-2" />
                HTML Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="htmlContent"
                value={template.htmlContent}
                onChange={(e) => setTemplate({ ...template, htmlContent: e.target.value })}
                placeholder="Enter HTML content..."
                rows={15}
                className="w-full bg-matrix-darker border-matrix-dark text-terminal-cyan font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Text Content Editor */}
          <Card className="terminal-card">
            <CardHeader>
              <CardTitle className="text-lg text-terminal-cyan flex items-center">
                <Type className="h-5 w-5 mr-2" />
                Text Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={template.textContent}
                onChange={(e) => setTemplate({ ...template, textContent: e.target.value })}
                placeholder="Enter plain text content..."
                rows={8}
                className="w-full bg-matrix-darker border-matrix-dark text-terminal-cyan font-mono text-sm"
              />
            </CardContent>
          </Card>
        </div>

        {/* Variables and Preview */}
        <div className="space-y-6">
          {/* Available Variables */}
          <Card className="terminal-card">
            <CardHeader>
              <CardTitle className="text-lg text-terminal-cyan flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Available Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {availableVariables.map((variable) => (
                  <div key={variable.name} className="flex items-center justify-between p-2 bg-matrix-darker rounded">
                    <div className="flex-1">
                      <div className="text-terminal-green font-semibold">{{{variable.name}}}</div>
                      <div className="text-xs text-terminal-cyan">{variable.description}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addVariable(variable)}
                      className="text-terminal-purple hover:text-terminal-cyan"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Variables */}
          <Card className="terminal-card">
            <CardHeader>
              <CardTitle className="text-lg text-terminal-cyan flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Selected Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {variables.map((variable) => (
                  <div key={variable.name} className="flex items-center justify-between p-2 bg-matrix-darker rounded">
                    <div className="flex-1">
                      <div className="text-terminal-green font-semibold">{{{variable.name}}}</div>
                      <div className="text-xs text-terminal-cyan">{variable.description}</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => insertVariable(variable.name)}
                        className="text-terminal-blue hover:text-terminal-cyan"
                        title="Insert into HTML"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeVariable(variable.name)}
                        className="text-terminal-red hover:text-terminal-red"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="terminal-card">
            <CardHeader>
              <CardTitle className="text-lg text-terminal-cyan flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={previewMode === 'html' ? 'default' : 'outline'}
                    onClick={() => setPreviewMode('html')}
                    className="btn-neon bg-terminal-blue border-terminal-blue hover:bg-terminal-blue hover:text-black"
                  >
                    <Code className="h-3 w-3 mr-1" />
                    HTML
                  </Button>
                  <Button
                    size="sm"
                    variant={previewMode === 'text' ? 'default' : 'outline'}
                    onClick={() => setPreviewMode('text')}
                    className="btn-neon bg-terminal-blue border-terminal-blue hover:bg-terminal-blue hover:text-black"
                  >
                    <Type className="h-3 w-3 mr-1" />
                    Text
                  </Button>
                </div>

                <div className="bg-matrix-darker p-4 rounded max-h-64 overflow-y-auto">
                  {previewMode === 'html' ? (
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: processTemplate(template.htmlContent, previewData) 
                      }}
                      className="prose prose-sm max-w-none"
                    />
                  ) : (
                    <pre className="text-terminal-cyan text-sm whitespace-pre-wrap">
                      {processTemplate(template.textContent, previewData)}
                    </pre>
                  )}
                </div>

                <Button
                  onClick={generatePreview}
                  className="w-full btn-neon bg-terminal-green border-terminal-green hover:bg-terminal-green hover:text-black"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Generate Preview
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="terminal-card">
            <CardHeader>
              <CardTitle className="text-lg text-terminal-cyan flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={downloadTemplate}
                className="w-full btn-neon bg-terminal-purple border-terminal-purple hover:bg-terminal-purple hover:text-black"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button
                onClick={() => copyToClipboard(template.htmlContent)}
                className="w-full btn-neon bg-terminal-blue border-terminal-blue hover:bg-terminal-blue hover:text-black"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy HTML
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateEditor;
