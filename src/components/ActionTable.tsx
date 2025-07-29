import { useState } from 'react';
import { Check, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { AlertData } from './Dashboard';
import { CrisisProcessDialog } from './CrisisProcessDialog';

interface ActionTableProps {
  alertData: AlertData[];
  onUpdateAcknowledgment: (alertId: string, acknowledged: boolean) => void;
  loading: boolean;
}

export const ActionTable = ({ alertData, onUpdateAcknowledgment, loading }: ActionTableProps) => {
  const [selectedIncident, setSelectedIncident] = useState<AlertData | null>(null);
  const [crisisDialogOpen, setCrisisDialogOpen] = useState(false);

  const handleAcknowledgment = async (alert: AlertData) => {
    try {
      // Get webhooks from localStorage
      const webhooks = JSON.parse(localStorage.getItem('webhooks') || '{}');
      const teamWebhook = webhooks[alert.equipe];
      
      if (!teamWebhook) {
        toast({
          title: "Webhook não configurado",
          description: `Configure o webhook para a equipe ${alert.equipe}`,
          variant: "destructive",
        });
        return;
      }

      // Send Google Chat message
      const message = {
        text: `🚨 *Acionamento de Alerta*\n\n*Tipo:* ${alert.tipo}\n*Equipe:* ${alert.equipe}\n*Severidade:* ${alert.severidade}\n*Título:* ${alert.titulo}\n*Abertura:* ${alert.abertura}`
      };

      await fetch(teamWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      // Update acknowledgment status
      onUpdateAcknowledgment(alert.id, true);
      
      toast({
        title: "Alerta acionado com sucesso",
        description: `Mensagem enviada para a equipe ${alert.equipe}`,
      });
    } catch (error) {
      console.error('Error sending webhook:', error);
      toast({
        title: "Erro ao acionar alerta",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    }
  };

  const handleIncidentClick = (alert: AlertData) => {
    if (alert.tipo.toLowerCase().includes('incidente')) {
      setSelectedIncident(alert);
      setCrisisDialogOpen(true);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'SEV3':
        return 'bg-sev3-incident text-white';
      case 'SEV4':
        return 'bg-sev4-incident text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="bg-panel-bg border-border">
      <CardHeader>
        <CardTitle className="text-primary">Acionamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-hover-bg">
                <TableHead className="text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-muted-foreground">Alerta</TableHead>
                <TableHead className="text-muted-foreground">Equipe</TableHead>
                <TableHead className="text-muted-foreground">Abertura</TableHead>
                <TableHead className="text-muted-foreground">Título</TableHead>
                <TableHead className="text-muted-foreground">Severidade</TableHead>
                <TableHead className="text-muted-foreground">Acionado</TableHead>
                <TableHead className="text-muted-foreground">E0</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Carregando dados...
                  </TableCell>
                </TableRow>
              ) : alertData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum dado disponível
                  </TableCell>
                </TableRow>
              ) : (
                alertData.map((alert) => (
                  <TableRow 
                    key={alert.id} 
                    className="border-border hover:bg-hover-bg transition-colors"
                  >
                    <TableCell className="font-medium">{alert.tipo}</TableCell>
                    <TableCell>{alert.alerta}</TableCell>
                    <TableCell>{alert.equipe}</TableCell>
                    <TableCell>
                      {new Date(alert.abertura).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-xs">{alert.titulo}</span>
                        {alert.tipo.toLowerCase().includes('incidente') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleIncidentClick(alert)}
                            className="p-1 h-auto hover:bg-hover-bg"
                            title="Iniciar processo de crise"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(alert.severidade)}>
                        {alert.severidade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant={alert.acionado ? "default" : "outline"}
                        size="sm"
                        onClick={() => !alert.acionado && handleAcknowledgment(alert)}
                        disabled={alert.acionado}
                        className={`${
                          alert.acionado 
                            ? 'bg-success text-white hover:bg-success/90' 
                            : 'border-border hover:bg-hover-bg'
                        }`}
                      >
                        {alert.acionado ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>{alert.e0}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <CrisisProcessDialog
          open={crisisDialogOpen}
          onOpenChange={setCrisisDialogOpen}
          incident={selectedIncident}
        />
      </CardContent>
    </Card>
  );
};