import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Calendar, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RDM {
  id: string;
  rdmNumber: string;
  title: string;
  responsible: string;
  status: 'open' | 'in_progress' | 'pending' | 'done';
  priority: 'high' | 'medium' | 'low';
  startDate: string;
  endDate?: string;
  description: string;
  team: string;
}

export const RDMTracker = () => {
  const [expandedRDM, setExpandedRDM] = useState<string | null>(null);

  // Mock data - replace with real API data
  const rdms: RDM[] = [
    {
      id: 'rdm-001',
      rdmNumber: 'RDM-2024-001',
      title: 'Atualização Sistema Monitoramento',
      responsible: 'Equipe Infra',
      status: 'in_progress',
      priority: 'high',
      startDate: '14:00',
      endDate: '16:00',
      description: 'Atualização planejada do sistema de monitoramento principal com novas funcionalidades.',
      team: 'Infraestrutura'
    },
    {
      id: 'rdm-002',
      rdmNumber: 'RDM-2024-002',
      title: 'Implementação Backup Redundante',
      responsible: 'Equipe Cloud',
      status: 'pending',
      priority: 'medium',
      startDate: '18:00',
      endDate: '19:00',
      description: 'Implementação de sistema de backup redundante para maior segurança dos dados.',
      team: 'Cloud'
    },
    {
      id: 'rdm-003',
      rdmNumber: 'RDM-2024-003',
      title: 'Migração Servidores Cloud',
      responsible: 'Equipe SysAdmin',
      status: 'open',
      priority: 'high',
      startDate: '20:00',
      endDate: '24:00',
      description: 'Migração de servidores para nova infraestrutura em nuvem.',
      team: 'SysAdmin'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-info text-white';
      case 'in_progress':
        return 'bg-warning text-black';
      case 'pending':
        return 'bg-sev3-incident text-white';
      case 'done':
        return 'bg-success text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberta';
      case 'in_progress':
        return 'Em Progresso';
      case 'pending':
        return 'Pendente';
      case 'done':
        return 'Finalizada';
      default:
        return 'Desconhecido';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return 'Normal';
    }
  };

  return (
    <Card className="bg-panel-bg border-border">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Acompanhamento de RDMs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rdms.map((rdm) => (
            <div key={rdm.id} className="border border-border rounded-lg p-4 bg-background/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => 
                      setExpandedRDM(
                        expandedRDM === rdm.id ? null : rdm.id
                      )
                    }
                    className="p-1 h-auto hover:bg-hover-bg"
                  >
                    {expandedRDM === rdm.id ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{rdm.rdmNumber}</h4>
                      <span className="text-sm text-muted-foreground">-</span>
                      <span className="text-sm font-medium">{rdm.title}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {rdm.responsible}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {rdm.startDate} {rdm.endDate && `- ${rdm.endDate}`}
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className={`h-3 w-3 ${getPriorityColor(rdm.priority)}`} />
                        <span className={getPriorityColor(rdm.priority)}>
                          {getPriorityText(rdm.priority)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{rdm.team}</span>
                  <Badge className={getStatusColor(rdm.status)}>
                    {getStatusText(rdm.status)}
                  </Badge>
                </div>
              </div>
              
              {expandedRDM === rdm.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">{rdm.description}</p>
                </div>
              )}
            </div>
          ))}
          
          {rdms.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma RDM em andamento
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};