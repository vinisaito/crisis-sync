import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { AlertData } from './Dashboard';

interface CrisisProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident: AlertData | null;
}

export const CrisisProcessDialog = ({ open, onOpenChange, incident }: CrisisProcessDialogProps) => {
  const [operatorName, setOperatorName] = useState('');
  const [spreadsheetLink, setSpreadsheetLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!operatorName.trim() || !spreadsheetLink.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha seu nome e adicione o link da planilha",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get crisis webhook from localStorage
      const crisisWebhook = localStorage.getItem('crisisWebhook');
      
      if (!crisisWebhook) {
        toast({
          title: "Webhook de crise não configurado",
          description: "Configure o webhook para processos de crise",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Send crisis process notification
      const message = {
        text: `🚨 *PROCESSO DE CRISE INICIADO*\n\n*Incidente:* ${incident?.titulo}\n*Operador:* ${operatorName}\n*Severidade:* ${incident?.severidade}\n*Equipe:* ${incident?.equipe}\n*Planilha:* ${spreadsheetLink}\n\n⚠️ *Processo de crise em andamento - Atenção imediata necessária*`
      };

      await fetch(crisisWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      toast({
        title: "Processo de crise iniciado",
        description: "Notificação enviada com sucesso",
      });

      // Reset form and close dialog
      setOperatorName('');
      setSpreadsheetLink('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending crisis notification:', error);
      toast({
        title: "Erro ao iniciar processo de crise",
        description: "Não foi possível enviar a notificação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-panel-bg border-border">
        <DialogHeader>
          <DialogTitle className="text-primary">Iniciar Processo de Crise</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="incident-title">Incidente</Label>
            <Input
              id="incident-title"
              value={incident?.titulo || ''}
              disabled
              className="bg-muted text-muted-foreground"
            />
          </div>
          
          <div>
            <Label htmlFor="operator-name">Seu Nome *</Label>
            <Input
              id="operator-name"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              placeholder="Digite seu nome"
              className="bg-background border-border"
            />
          </div>
          
          <div>
            <Label htmlFor="spreadsheet-link">Link da Planilha *</Label>
            <Input
              id="spreadsheet-link"
              value={spreadsheetLink}
              onChange={(e) => setSpreadsheetLink(e.target.value)}
              placeholder="Cole o link da planilha aqui"
              className="bg-background border-border"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border hover:bg-hover-bg"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? 'Enviando...' : 'Iniciar Processo de Crise'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};