import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      operatorName, 
      warRoomLink, 
      incidentTitle, 
      incidentSeverity, 
      incidentTeam 
    } = await req.json()

    // Configurações fixas no código (você pode alterar estas URLs)
    const TEMPLATE_SPREADSHEET_ID = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" // Substitua pelo ID da sua planilha template
    const GOOGLE_CHAT_WEBHOOK = "https://chat.googleapis.com/v1/spaces/YOUR_SPACE/messages?key=YOUR_KEY" // Substitua pela sua webhook do Google Chat
    const SHARE_RECIPIENTS = ["email1@example.com", "email2@example.com"] // Substitua pelos emails dos destinatários

    // Obter secrets do Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar se os secrets existem
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY')
    const googleAccessToken = Deno.env.get('GOOGLE_ACCESS_TOKEN')

    if (!googleApiKey || !googleAccessToken) {
      return new Response(
        JSON.stringify({ 
          error: 'Google API credentials not configured. Please set GOOGLE_API_KEY and GOOGLE_ACCESS_TOKEN in Supabase secrets.' 
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 1. Criar cópia da planilha
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const newSpreadsheetName = `Processo_Crise_${incidentSeverity}_${timestamp}`

    const copyResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${TEMPLATE_SPREADSHEET_ID}/copy`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSpreadsheetName,
        }),
      }
    )

    if (!copyResponse.ok) {
      throw new Error(`Failed to copy spreadsheet: ${copyResponse.statusText}`)
    }

    const newSpreadsheet = await copyResponse.json()
    const newSpreadsheetId = newSpreadsheet.id
    const newSpreadsheetUrl = `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit`

    // 2. Compartilhar planilha com destinatários
    for (const email of SHARE_RECIPIENTS) {
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${newSpreadsheetId}/permissions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${googleAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'writer',
            type: 'user',
            emailAddress: email,
          }),
        }
      )
    }

    // 3. Atualizar dados na planilha (opcional - adicionar informações do incidente)
    const updateData = {
      values: [
        ['PROCESSO DE CRISE - INFORMAÇÕES'],
        ['Operador:', operatorName],
        ['Incidente:', incidentTitle],
        ['Severidade:', incidentSeverity],
        ['Equipe:', incidentTeam],
        ['War Room:', warRoomLink],
        ['Data/Hora:', new Date().toLocaleString('pt-BR')],
        ['Planilha criada automaticamente pelo sistema CIOPS']
      ]
    }

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${newSpreadsheetId}/values/A1:B8?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    )

    // 4. Enviar mensagem no Google Chat
    const chatMessage = {
      text: `🚨 **PROCESSO DE CRISE INICIADO**

📋 **Detalhes do Incidente:**
• **Operador:** ${operatorName}
• **Incidente:** ${incidentTitle}
• **Severidade:** ${incidentSeverity}
• **Equipe:** ${incidentTeam}
• **War Room:** ${warRoomLink}

📊 **Planilha de Acompanhamento:**
${newSpreadsheetUrl}

⚠️ **Ação imediata necessária - Processo de crise em andamento**`
    }

    await fetch(GOOGLE_CHAT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatMessage),
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        spreadsheetUrl: newSpreadsheetUrl,
        spreadsheetId: newSpreadsheetId,
        message: 'Processo de crise iniciado com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in crisis-process function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process crisis request',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})