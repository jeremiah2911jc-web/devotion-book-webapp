"""Check scanner behavior using generated, invalid credentials only."""
import os
import secrets
import string
import subprocess


def random_text(length):
    return "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(length))


fixtures = [
    ("Resend SDK argument", 'new Resend("re_' + random_text(32) + '")', 1),
    ("Resend environment assignment", "RESEND_API_KEY=re_" + random_text(32), 1),
    ("Supabase server secret literal", 'const value = "sb_secret_' + random_text(40) + '"', 1),
    ("Supabase environment assignment", "SUPABASE_SECRET_KEY=sb_secret_" + random_text(40), 1),
    ("Default GitHub token rule", 'const value = "ghp_' + random_text(36) + '"', 1),
    ("Public Supabase key", 'const value = "sb_publishable_' + random_text(40) + '"', 0),
    ("Documentation placeholder", 'const value = "re_example"', 0),
    ("Artifact checksum", 'const digest = "' + secrets.token_hex(32) + '"', 0),
]

for label, value, expected in fixtures:
    result = subprocess.run(
        [os.environ["GITLEAKS_BINARY"], "stdin", "--config", ".gitleaks.toml", "--redact=100", "--no-banner"],
        input=value,
        text=True,
        capture_output=True,
        timeout=15,
    )
    if result.returncode != expected:
        raise SystemExit(f"Credential detector regression: {label}; expected {expected}, got {result.returncode}")
    print(f"PASS: {label}")
