import { useState, useEffect } from 'react';
import { Settings, Sun, Moon, AlertTriangle, FileText, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
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
  num_chamado?: string;
  status?: string;
}

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);
  const [alertData, setAlertData] = useState<AlertData[]>([]);
  const [filteredAlertData, setFilteredAlertData] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'incidents' | 'rdm' | 'notes' | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Fetch data from API
  const fetchAlertData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://7nu1y7qzs1.execute-api.us-east-1.amazonaws.com/prod/dados');
      const data = await response.json();
      
      // Parse the body since API returns {statusCode: 200, body: "[...]"}
      const apiData = JSON.parse(data.body);
      
      // Transform API data to match our interface
      const transformedData: AlertData[] = apiData.map((item: any, index: number) => ({
        id: `alert-${index}`,
        tipo: item.classificacao || 'Incidente',
        alerta: item.num_chamado || 'N/A',
        equipe: item.equipe || 'Equipe Não Definida',
        abertura: item.dat_abertura || new Date().toISOString(),
        titulo: item.titulo || 'Título não disponível',
        severidade: item.severidade?.includes('3') ? 'SEV3' : 'SEV4',
        acionado: item.status === 'Resolvido',
        e0: item.status || 'N/A',
        num_chamado: item.num_chamado,
        status: item.status
      }));
      
      setAlertData(transformedData);
      setFilteredAlertData(transformedData);
      
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
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
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
    setFilteredAlertData(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acionado: acknowledged }
          : alert
      )
    );
  };

  // Filter function for cards
  const handleCardFilter = (filterType: string) => {
    let filtered: AlertData[] = [];
    
    switch (filterType) {
      case 'sev4-incidents':
        filtered = alertData.filter(alert => 
          alert.tipo.toLowerCase() === 'incidente' && 
          (alert.severidade === 'SEV4' || alert.severidade.includes('4') || alert.severidade.includes('5'))
        );
        break;
      case 'sev4-alerts':
        filtered = alertData.filter(alert => 
          alert.tipo.toLowerCase() === 'solicitação' && 
          (alert.severidade === 'SEV4' || alert.severidade.includes('4') || alert.severidade.includes('5'))
        );
        break;
      case 'sev3-incidents':
        filtered = alertData.filter(alert => 
          alert.tipo.toLowerCase() === 'incidente' && 
          (alert.severidade === 'SEV3' || alert.severidade.includes('3'))
        );
        break;
      case 'pending-sev4-incidents':
        filtered = alertData.filter(alert => 
          alert.tipo.toLowerCase() === 'incidente' && 
          (alert.severidade === 'SEV4' || alert.severidade.includes('4') || alert.severidade.includes('5')) &&
          (!alert.e0 || alert.e0 === 'N/A' || alert.e0.trim() === '')
        );
        break;
      case 'pending-sev4-alerts':
        filtered = alertData.filter(alert => 
          alert.tipo.toLowerCase() === 'solicitação' && 
          (alert.severidade === 'SEV4' || alert.severidade.includes('4') || alert.severidade.includes('5')) &&
          (!alert.e0 || alert.e0 === 'N/A' || alert.e0.trim() === '')
        );
        break;
      case 'pending-sev3-incidents':
        filtered = alertData.filter(alert => 
          alert.tipo.toLowerCase() === 'incidente' && 
          (alert.severidade === 'SEV3' || alert.severidade.includes('3')) &&
          (!alert.e0 || alert.e0 === 'N/A' || alert.e0.trim() === '')
        );
        break;
      default:
        filtered = alertData;
    }
    
    if (activeFilter === filterType) {
      // Se clicar no mesmo filtro, remove o filtro
      setFilteredAlertData(alertData);
      setActiveFilter(null);
    } else {
      setFilteredAlertData(filtered);
      setActiveFilter(filterType);
    }
  };

  useEffect(() => {
    fetchAlertData();
    // Refresh data every 10 minutes
    const interval = setInterval(fetchAlertData, 600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Apply dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  const sidebarItems = [
    {
      title: "Incidentes Críticos",
      icon: AlertTriangle,
      key: 'incidents' as const,
    },
    {
      title: "Acompanhamento RDMs",
      icon: FileText,
      key: 'rdm' as const,
    },
    {
      title: "Recados do Turno",
      icon: MessageSquare,
      key: 'notes' as const,
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background text-foreground">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-dashboard-bg border-b border-border p-6">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
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
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-dashboard-bg">
            <div className="container mx-auto p-6 max-w-7xl">
              <div className="space-y-8">
                {/* Monitoring Cards Section */}
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-6 text-primary">PAINEL ACIONAMENTOS</h2>
                  <MonitoringCards alertData={alertData} onCardFilter={handleCardFilter} activeFilter={activeFilter} />
                </div>

                {/* Action Table */}
                <ActionTable 
                  alertData={filteredAlertData} 
                  onUpdateAcknowledgment={updateAlertAcknowledgment}
                  loading={loading}
                />

                {/* Expandable Sections */}
                {activeSection === 'incidents' && <CriticalIncidents />}
                {activeSection === 'rdm' && <RDMTracker />}
                {activeSection === 'notes' && <ShiftNotes />}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-16 bg-sidebar-background border-l border-sidebar-border flex flex-col">
          <div className="flex flex-col gap-2 p-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.key}
                variant="ghost"
                size="icon"
                onClick={() => setActiveSection(activeSection === item.key ? null : item.key)}
                className={`w-12 h-12 ${
                  activeSection === item.key 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
                title={item.title}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            ))}
          </div>
        </div>

        {/* Webhook Configuration Modal */}
        <WebhookConfig 
          open={showWebhookConfig} 
          onOpenChange={setShowWebhookConfig} 
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;