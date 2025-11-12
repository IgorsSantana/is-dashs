import json
import os
import requests
import msal

TENANT_ID = os.environ.get("TENANT_ID")
CLIENT_ID = os.environ.get("CLIENT_ID")
CLIENT_SECRET = os.environ.get("CLIENT_SECRET")
DEFAULT_WORKSPACE_ID = os.environ.get("POWERBI_WORKSPACE_ID")
DEFAULT_REPORT_ID = os.environ.get("POWERBI_DEFAULT_REPORT_ID")
DEFAULT_DATASET_ID = os.environ.get("POWERBI_DEFAULT_DATASET_ID")

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}" if TENANT_ID else None
RESOURCE_URL = "https://analysis.windows.net/powerbi/api"


def handler(event, context):
    try:
        validate_env()

        params = (event.get("queryStringParameters") or {}).copy()
        report_id = params.get("reportId") or DEFAULT_REPORT_ID
        workspace_id = params.get("workspaceId") or DEFAULT_WORKSPACE_ID
        dataset_id = params.get("datasetId") or DEFAULT_DATASET_ID

        if not report_id or not workspace_id:
            return _response(
                400,
                {"error": "Informe reportId e workspaceId (ou configure POWERBI_DEFAULT_REPORT_ID e POWERBI_WORKSPACE_ID)."},
            )

        aad_token = get_aad_token()
        report_info = get_report_info(aad_token, workspace_id, report_id)
        embed_token = generate_embed_token(aad_token, workspace_id, report_id, dataset_id)

        return _response(
            200,
            {
                "token": embed_token["token"],
                "embedUrl": report_info["embedUrl"],
                "reportId": report_id,
            },
        )
    except Exception as exc:
        return _response(500, {"error": str(exc)})


def validate_env():
    missing = []
    if not TENANT_ID:
        missing.append("TENANT_ID")
    if not CLIENT_ID:
        missing.append("CLIENT_ID")
    if not CLIENT_SECRET:
        missing.append("CLIENT_SECRET")
    if missing:
        raise Exception(f"Variáveis de ambiente ausentes: {', '.join(missing)}")


def get_aad_token():
    app = msal.ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET,
    )
    result = app.acquire_token_for_client(scopes=[f"{RESOURCE_URL}/.default"])
    if "access_token" not in result:
        raise Exception(result.get("error_description") or "Falha ao obter token AAD")
    return result["access_token"]


def get_report_info(access_token, workspace_id, report_id):
    url = f"https://api.powerbi.com/v1.0/myorg/groups/{workspace_id}/reports/{report_id}"
    resp = requests.get(url, headers={"Authorization": f"Bearer {access_token}"})
    if resp.status_code != 200:
        raise Exception(f"Erro ao obter relatório: {resp.text}")
    return resp.json()


def generate_embed_token(access_token, workspace_id, report_id, dataset_id=None):
    url = f"https://api.powerbi.com/v1.0/myorg/groups/{workspace_id}/reports/{report_id}/GenerateToken"
    body = {"accessLevel": "View"}
    if dataset_id:
        body["datasets"] = [{"id": dataset_id}]

    resp = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        json=body,
    )
    if resp.status_code != 200:
        raise Exception(f"Erro ao gerar embed token: {resp.text}")
    return resp.json()


def _response(status, payload):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload),
    }

