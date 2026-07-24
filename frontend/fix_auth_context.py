from pathlib import Path
path = Path('context/AuthContext.tsx')
text = path.read_text()
text = text.replace('headers: { Authorization: `****** },', 'headers: { Authorization: `Bearer ${token}` },')
text = text.replace('    () => () => (token ? { Authorization: `****** } : {}),', '    () => () => (token ? { Authorization: `Bearer ${token}` } : {}),')
path.write_text(text)
print(text[text.index('headers: { Authorization:'):text.index('headers: { Authorization:')+50])
print(text[text.index('() => () => (token ? { Authorization:'):text.index('() => () => (token ? { Authorization:')+80])
