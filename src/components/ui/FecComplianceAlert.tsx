'use client';

import { useState, useEffect } from 'react';

interface FecComplianceAlertProps {
  projectId: string;
  currentFunding: number;
  fundingGoal: number;
}

export default function FecComplianceAlert({ projectId, currentFunding, fundingGoal }: FecComplianceAlertProps) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'warning' | 'alert' | null>(null);

  useEffect(() => {
    // Check FEC compliance thresholds
    if (currentFunding >= 5000) {
      setAlertType('alert');
      setShowAlert(true);
    } else if (currentFunding >= 4500) {
      setAlertType('warning');
      setShowAlert(true);
    } else {
      setShowAlert(false);
      setAlertType(null);
    }
  }, [currentFunding]);

  if (!showAlert || !alertType) {
    return null;
  }

  const isAlert = alertType === 'alert';
  const threshold = isAlert ? 5000 : 4500;

  return (
    <div className={`card-holographic p-6 mb-6 ${
      isAlert ? 'border-terminal-red' : 'border-terminal-orange'
    }`}>
      <div className="flex items-start space-x-4">
        <div className="text-3xl">
          {isAlert ? '⚠️' : '⚠️'}
        </div>
        
        <div className="flex-1">
          <h3 className={`text-xl font-bold mb-2 ${
            isAlert ? 'text-terminal-red' : 'text-terminal-orange'
          }`}>
            FEC Compliance {isAlert ? 'Alert' : 'Warning'}
          </h3>
          
          <p className="text-terminal-cyan mb-4">
            Your project has reached the ${threshold.toLocaleString()} threshold. 
            {isAlert 
              ? ' You are now required to comply with FEC regulations.'
              : ' You are approaching the FEC compliance threshold.'
            }
          </p>
          
          <div className="space-y-3">
            <div className="p-4 bg-black/20 rounded border border-terminal-green">
              <h4 className="text-terminal-green font-semibold mb-2">
                Required Actions:
              </h4>
              <ul className="text-terminal-cyan text-sm space-y-1">
                <li>• Register with the FEC if required</li>
                <li>• File required reports and disclosures</li>
                <li>• Maintain detailed records of all donations</li>
                <li>• Comply with contribution limits and restrictions</li>
              </ul>
            </div>
            
            <div className="p-4 bg-black/20 rounded border border-terminal-purple">
              <h4 className="text-terminal-purple font-semibold mb-2">
                Legal Resources:
              </h4>
              <ul className="text-terminal-cyan text-sm space-y-1">
                <li>• <a href="https://www.fec.gov/" target="_blank" rel="noopener noreferrer" className="text-terminal-green hover:underline">FEC Official Website</a></li>
                <li>• <a href="https://www.fec.gov/help-candidates-and-committees/" target="_blank" rel="noopener noreferrer" className="text-terminal-green hover:underline">FEC Help for Candidates and Committees</a></li>
                <li>• <a href="https://www.fec.gov/help-candidates-and-committees/forms/" target="_blank" rel="noopener noreferrer" className="text-terminal-green hover:underline">Required Forms and Filings</a></li>
                <li>• <a href="https://www.fec.gov/help-candidates-and-committees/guide-committee-candidates/" target="_blank" rel="noopener noreferrer" className="text-terminal-green hover:underline">Guide for Committee Candidates</a></li>
              </ul>
            </div>
            
            <div className="p-4 bg-black/20 rounded border border-terminal-cyan">
              <h4 className="text-terminal-cyan font-semibold mb-2">
                Important Notes:
              </h4>
              <ul className="text-terminal-cyan text-sm space-y-1">
                <li>• This is not legal advice. Consult with a qualified attorney.</li>
                <li>• FEC regulations vary by project type and jurisdiction.</li>
                <li>• Failure to comply may result in penalties and fines.</li>
                <li>• Keep detailed records of all financial transactions.</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => window.open('https://www.fec.gov/', '_blank')}
              className="btn-neon"
            >
              Visit FEC Website
            </button>
            
            <button
              onClick={() => setShowAlert(false)}
              className="px-4 py-2 border border-terminal-cyan text-terminal-cyan rounded hover:bg-terminal-cyan hover:text-black transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
