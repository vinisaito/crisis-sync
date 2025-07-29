import { useState, useEffect } from 'react';
import { Settings, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { MonitoringCards } from './MonitoringCards';
import { ActionTable } from './ActionTable';
import { CriticalIncidents } from './CriticalIncidents';
import { RDMTracker } from './RDMTracker';
import { ShiftNotes } from './ShiftNotes';
import { WebhookConfig } from './WebhookConfig';

export interface AlertData {
  id: string;
  tipo: string;
  alerta: string;
  equipe: string;
  abertura: string;
  titulo: string;
  severidade: 'SEV3' | 'SEV4';
  acionado: boolean;
  e0: string;
}

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);
  const [alertData, setAlertData] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'incidents' | 'rdm' | 'notes' | null>(null);

  // Fetch data from API
  const fetchAlertData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://7nu1y7qzs1.execute-api.us-east-1.amazonaws.com/prod/dados');
      const data = await response.json();
      
      // Transform API data to match our interface
      const transformedData: AlertData[] = data.map((item: any, index: number) => ({
        id: `alert-${index}`,
        tipo: item.tipo || 'Incidente',
        alerta: item.alerta || 'N/A',
        equipe: item.equipe || 'Equipe Não Definida',
        abertura: item.abertura || new Date().toISOString(),
        titulo: item.titulo || 'Título não disponível',
        severidade: item.severidade === 'SEV3' ? 'SEV3' : 'SEV4',
        acionado: item.acionado || false,
        e0: item.e0 || 'N/A'
      }));
      
      setAlertData(transformedData);
      
      // Check for unacknowledged alerts and play sound
      const unacknowledged = transformedData.filter(alert => !alert.acionado);
      if (unacknowledged.length > 0) {
        playAlertSound();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro ao buscar dados",
        description: "Não foi possível conectar com a API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Play alert sound for unacknowledged alerts
  const playAlertSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Dqu2sgBDR+w/PCaWEbEBOa5rWgdyoEKAA=');
    audio.play().catch(() => {
      // Fallback if audio fails
      console.log('Alert sound could not be played');
    });
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Update alert acknowledgment status
  const updateAlertAcknowledgment = (alertId: string, acknowledged: boolean) => {
    setAlertData(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acionado: acknowledged }
          : alert
      )
    );
  };

  useEffect(() => {
    fetchAlertData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchAlertData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Apply dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-dashboard-bg text-foreground">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-primary mb-2">
              PAINEL CIOPS - MONITORAÇÃO
            </h1>
            <p className="text-muted-foreground">
              Centro Integrado de Operações e Segurança
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowWebhookConfig(true)}
              className="border-border hover:bg-hover-bg"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="border-border hover:bg-hover-bg"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Monitoring Cards Section */}
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-6 text-primary">PAINEL ACIONAMENTOS</h2>
            <MonitoringCards alertData={alertData} />
          </div>

          {/* Action Table */}
          <ActionTable 
            alertData={alertData} 
            onUpdateAcknowledgment={updateAlertAcknowledgment}
            loading={loading}
          />

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              variant={activeSection === 'incidents' ? 'default' : 'outline'}
              onClick={() => setActiveSection(activeSection === 'incidents' ? null : 'incidents')}
              className="border-border hover:bg-hover-bg"
            >
              Incidentes Críticos em Andamento
            </Button>
            <Button
              variant={activeSection === 'rdm' ? 'default' : 'outline'}
              onClick={() => setActiveSection(activeSection === 'rdm' ? null : 'rdm')}
              className="border-border hover:bg-hover-bg"
            >
              Acompanhamento de RDMs
            </Button>
            <Button
              variant={activeSection === 'notes' ? 'default' : 'outline'}
              onClick={() => setActiveSection(activeSection === 'notes' ? null : 'notes')}
              className="border-border hover:bg-hover-bg"
            >
              Recados do Turno
            </Button>
          </div>

          {/* Expandable Sections */}
          {activeSection === 'incidents' && <CriticalIncidents />}
          {activeSection === 'rdm' && <RDMTracker />}
          {activeSection === 'notes' && <ShiftNotes />}
        </div>

        {/* Webhook Configuration Modal */}
        <WebhookConfig 
          open={showWebhookConfig} 
          onOpenChange={setShowWebhookConfig} 
        />
      </div>
    </div>
  );
};

export default Dashboard;