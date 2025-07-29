import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertData } from './Dashboard';

interface MonitoringCardsProps {
  alertData: AlertData[];
}

export const MonitoringCards = ({ alertData }: MonitoringCardsProps) => {
  // Calculate metrics
  const sev4Incidents = alertData.filter(alert => 
    alert.tipo.toLowerCase().includes('incidente') && alert.severidade === 'SEV4'
  ).length;
  
  const sev4Alerts = alertData.filter(alert => 
    alert.tipo.toLowerCase().includes('alerta') && alert.severidade === 'SEV4'
  ).length;
  
  const sev3Incidents = alertData.filter(alert => 
    alert.tipo.toLowerCase().includes('incidente') && alert.severidade === 'SEV3'
  ).length;

  const pendingSev4Incidents = alertData.filter(alert => 
    alert.tipo.toLowerCase().includes('incidente') && 
    alert.severidade === 'SEV4' && 
    !alert.acionado
  ).length;

  const pendingSev4Alerts = alertData.filter(alert => 
    alert.tipo.toLowerCase().includes('alerta') && 
    alert.severidade === 'SEV4' && 
    !alert.acionado
  ).length;

  const pendingSev3Incidents = alertData.filter(alert => 
    alert.tipo.toLowerCase().includes('incidente') && 
    alert.severidade === 'SEV3' && 
    !alert.acionado
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-none">
      {/* SEV4 Incidents */}
      <div className="space-y-4">
        <Card className="bg-panel-bg border-sev4-incident/20 hover:border-sev4-incident/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sev4-incident text-sm font-medium uppercase tracking-wide">
              Incidentes SEV4
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-sev4-incident mb-2">
              {sev4Incidents}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-panel-bg/50 border-sev4-incident/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pendente Acionamento</span>
              <span className="text-lg font-semibold text-sev4-incident">
                {pendingSev4Incidents}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEV4 Alerts */}
      <div className="space-y-4">
        <Card className="bg-panel-bg border-sev4-alert/20 hover:border-sev4-alert/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sev4-alert text-sm font-medium uppercase tracking-wide">
              Alertas SEV4
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-sev4-alert mb-2">
              {sev4Alerts}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-panel-bg/50 border-sev4-alert/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pendente Acionamento</span>
              <span className="text-lg font-semibold text-sev4-alert">
                {pendingSev4Alerts}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEV3 Incidents */}
      <div className="space-y-4">
        <Card className="bg-panel-bg border-sev3-incident/20 hover:border-sev3-incident/40 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sev3-incident text-sm font-medium uppercase tracking-wide">
              Incidentes SEV3
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-sev3-incident mb-2">
              {sev3Incidents}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-panel-bg/50 border-sev3-incident/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pendente Acionamento</span>
              <span className="text-lg font-semibold text-sev3-incident">
                {pendingSev3Incidents}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};