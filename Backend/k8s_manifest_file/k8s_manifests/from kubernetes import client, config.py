from kubernetes import client, config
from kubernetes.client.rest import ApiException
import time
import requests

# Load the kubeconfig
config.load_kube_config()

# Define the namespace to monitor
NAMESPACE = 'production'

# Define the threshold for the number of running pods
POD_THRESHOLD = 2

# Define your Slack webhook URL
SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'

# Function to get the number of running pods
def get_running_pods_count(namespace):
    v1 = client.CoreV1Api()
    try:
        pods = v1.list_namespaced_pod(namespace)
        running_pods = [pod for pod in pods.items if pod.status.phase == 'Running']
        return len(running_pods)
    except ApiException as e:
        print(f"Exception when calling CoreV1Api->list_namespaced_pod: {e}")
        return 0

# Function to send an alert to Slack
def send_alert_to_slack(pod_count):
    message = {
        "text": f"Alert: More than {POD_THRESHOLD} pods are running in the {NAMESPACE} namespace. Current count: {pod_count}"
    }
    response = requests.post(SLACK_WEBHOOK_URL, json=message)
    if response.status_code != 200:
        raise ValueError(f"Request to Slack returned an error {response.status_code}, the response is:\n{response.text}")

if __name__ == '__main__':
    while True:
        running_pods_count = get_running_pods_count(NAMESPACE)
        print(f"Running pods in namespace '{NAMESPACE}': {running_pods_count}")

        if running_pods_count > POD_THRESHOLD:
            send_alert_to_slack(running_pods_count)
        
        time.sleep(300)  # Wait for 5 minutes before checking again
