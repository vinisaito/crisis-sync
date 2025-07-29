import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Clock, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CriticalIncident {
  id: string;
  incident: string;
  operator: string;
  room: string;
  timeline: string;
  status: 'ongoing' | 'resolved' | 'escalated';
  startTime: string;
  description: string;
}

export const CriticalIncidents = () => {
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);

  // Mock data - replace with real API data
  const criticalIncidents: CriticalIncident[] = [
    {
      id: 'ci-001',
      incident: 'Falha de conectividade Datacenter SP',
      operator: 'João Silva',
      room: 'NOC-01',
      timeline: '45 min',
      status: 'ongoing',
      startTime: '14:30',
      description: 'Problemas de conectividade detectados no datacenter principal de São Paulo, afetando múltiplos serviços.'
    },
    {
      id: 'ci-002',
      incident: 'DDoS Attack - Portal Principal',
      operator: 'Maria Santos',
      room: 'SOC-02',
      timeline: '1h 20min',
      status: 'escalated',
      startTime: '13:10',
      description: 'Ataque DDoS em andamento contra o portal principal, medidas de mitigação ativadas.'
    },
    {
      id: 'ci-003',
      incident: 'Operações TECH PORTO BANK',
      operator: 'Carlos Oliveira',
      room: 'NOC-03',
      timeline: '2h 15min',
      status: 'ongoing',
      startTime: '12:15',
      description: 'Incidente relacionado às operações do Tech Porto Bank, monitoramento contínuo em andamento.'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-warning text-black';
      case 'resolved':
        return 'bg-success text-white';
      case 'escalated':
        return 'bg-destructive text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'Em Andamento';
      case 'resolved':
        return 'Resolvido';
      case 'escalated':
        return 'Escalado';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <Card className="bg-panel-bg border-border">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
          Incidentes Críticos em Andamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {criticalIncidents.map((incident) => (
            <div key={incident.id} className="border border-border rounded-lg p-4 bg-background/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => 
                      setExpandedIncident(
                        expandedIncident === incident.id ? null : incident.id
                      )
                    }
                    className="p-1 h-auto hover:bg-hover-bg"
                  >
                    {expandedIncident === incident.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{incident.incident}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {incident.operator}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {incident.room}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {incident.timeline}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Início: {incident.startTime}</span>
                  <Badge className={getStatusColor(incident.status)}>
                    {getStatusText(incident.status)}
                  </Badge>
                </div>
              </div>
              
              {expandedIncident === incident.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">{incident.description}</p>
                </div>
              )}
            </div>
          ))}
          
          {criticalIncidents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum incidente crítico em andamento
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};