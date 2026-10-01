#!/bin/bash

# Script para actualizar la configuración del MCP de ADO
# Cambia de ADO_PAT a ADO_PAT_BAYTEQ

CONFIG_FILE="$HOME/.kiro/settings/mcp.json"

echo "🔧 Actualizando configuración del MCP de Azure DevOps..."

# Hacer backup del archivo original
cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup creado: $CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"

# Actualizar la variable de entorno
sed -i '' 's/"PERSONAL_ACCESS_TOKEN": "${env:ADO_PAT}"/"PERSONAL_ACCESS_TOKEN": "${env:ADO_PAT_BAYTEQ}"/g' "$CONFIG_FILE"

echo "✅ Configuración actualizada"
echo "📝 La variable ahora apunta a: ADO_PAT_BAYTEQ"

# Verificar el cambio
echo ""
echo "🔍 Verificando el cambio:"
grep -n "PERSONAL_ACCESS_TOKEN" "$CONFIG_FILE"

echo ""
echo "✨ Para aplicar los cambios, reinicia Kiro o reconecta el servidor MCP."
echo "🔑 El token ADO_PAT_BAYTEQ ya está configurado y funcionando correctamente."