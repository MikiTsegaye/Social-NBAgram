import os
import requests

def run_agent_audit():
    api_key = os.getenv("GEMINI_API_KEY")
    github_token = os.getenv("GITHUB_TOKEN")
    pr_num = os.getenv("PR_NUMBER")
    repo = os.getenv("REPO_NAME")

    if not api_key or not github_token:
        print("Missing secure tokens configuration. Skipping audit.")
        return

    # Load changes made in this pull request
    with open("pr_diff.txt", "r", encoding="utf-8", errors="ignore") as f:
        diff_text = f.read()

    if not diff_text.strip():
        print("Empty change list discovered.")
        return

    system_instruction = (
        "You are an expert academic code reviewer enforcing strict grading rules for an Android 2 / Frontend university capstone project. "
        "Analyze the code changes against these rigid criteria:\n"
        "1. ARCHITECTURE: Enforce strict MVC pattern. Node/Express is Controller, Mongoose is Model, React is View.\n"
        "2. LEGACY REQUIREMENT: All frontend-backend network transactions MUST use jQuery AJAX wrappers (.ajax(), .done(), .fail()). Flag any native fetch() or axios immediately as a disqualifying error.\n"
        "3. SECURITY GUARDS: Normal users must only edit/delete posts where author equals their ID. Private groups must block non-members.\n"
        "4. ROBUSTNESS: Ensure try/catch traps exist around all asynchronous routing processes or Mongoose database interactions to avoid server failures.\n"
        "Review the code edits. Point out precise code file rows that violate constraints or lack stability handles."
    )

    # Prepare safe instruction envelope using Gemini standard API parameters
    payload = {
        "contents": [{
            "parts": [
                {"text": f"{system_instruction}\n\nReview this code diff and list missing course requirements:\n\n{diff_text}"}
            ]
        }]
    }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    response = requests.post(url, json=payload)
    
    if response.status_code != 200:
        print("AI connection issue:", response.text)
        return

    review_comment = response.json()["candidates"][0]["content"]["parts"][0]["text"]

    # Post comment right onto the active GitHub PR interface
    github_url = f"https://api.github.com/repos/{repo}/issues/{pr_num}/comments"
    headers = {
        "Authorization": f"token {github_token}",
        "Accept": "application/vnd.github.v3+json"
    }
    comment_payload = {"body": f"### 🏀 NBA Capstone Guardian Audit Report:\n\n{review_comment}"}
    
    requests.post(github_url, json=comment_payload, headers=headers)
    print("Audit log successfully rendered on PR panel.")

if __name__ == "__main__":
    run_agent_audit()