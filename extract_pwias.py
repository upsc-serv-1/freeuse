#!/usr/bin/env python3
"""Extract PWOnlyIAS GS4 Q&A from API JSON to clean Markdown."""
import json, re, os, shutil, urllib.request
from collections import defaultdict

with open('pwias_api_data.json') as f:
    posts = json.load(f)

# Year taxonomy
req = urllib.request.Request('https://pwonlyias.com/wp-json/wp/v2/pyq-year?per_page=100', headers={'User-Agent': 'Mozilla/5.0'})
years_data = json.loads(urllib.request.urlopen(req).read())
year_map = {y['id']: y['name'] for y in years_data}

def clean_bold(text):
    """Remove internal spaces from ** markers only."""
    text = re.sub(r'\*\* +', '**', text)
    text = re.sub(r' +\*\*', '**', text)
    text = text.replace('****', '')
    return text

def convert_table(tbl_html):
    rows = re.findall(r'<tr>(.*?)</tr>', tbl_html, re.DOTALL)
    if not rows:
        return ''
    md = []
    for ri, row in enumerate(rows):
        cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
        th = re.findall(r'<th[^>]*>(.*?)</th>', row, re.DOTALL)
        all_cells = cells or th
        clean = []
        for c in all_cells:
            c = re.sub(r'<strong>(.*?)</strong>', r'**\1**', c)
            c = re.sub(r'<b>(.*?)</b>', r'**\1**', c)
            c = re.sub(r'<u>(.*?)</u>', r'\1', c)
            c = re.sub(r'<em>(.*?)</em>', r'*\1*', c)
            c = re.sub(r'<br\s*/?>', ' ', c)
            c = re.sub(r'<[^>]+>', '', c)
            c = c.replace('&nbsp;', ' ').replace('&amp;', '&')
            c = c.replace('&#8216;', "'").replace('&#8217;', "'")
            c = c.replace('&#8220;', '"').replace('&#8221;', '"')
            c = c.replace('&rsquo;', "'").replace('&lsquo;', "'")
            c = c.replace('&rdquo;', '"').replace('&ldquo;', '"')
            c = clean_bold(c.strip())
            c = re.sub(r' +', ' ', c)
            clean.append(c)
        md.append('| ' + ' | '.join(clean) + ' |')
        if ri == 0:
            md.append('| ' + ' | '.join(['---'] * len(clean)) + ' |')
    return '\n'.join(md)

def html_to_md(html):
    """Convert HTML answer to clean markdown."""
    # Tables first
    html = re.sub(r'<table[^>]*>(.*?)</table>', lambda m: convert_table(m.group(1)), html, flags=re.DOTALL)
    
    # Bold and formatting
    text = re.sub(r'<strong>(.*?)</strong>', r'**\1**', html)
    text = re.sub(r'<b>(.*?)</b>', r'**\1**', text)
    text = re.sub(r'<u>(.*?)</u>', r'\1', text)
    text = re.sub(r'<em>(.*?)</em>', r'*\1*', text)
    text = re.sub(r'<h[1-6][^>]*>(.*?)</h[1-6]>', r'### \1', text)
    text = re.sub(r'</p>', '\n\n', text)
    text = re.sub(r'<p[^>]*>', '', text)
    text = re.sub(r'</li>', '\n', text)
    text = re.sub(r'<li[^>]*>', '- ', text)
    text = re.sub(r'</ul>', '\n', text)
    text = re.sub(r'<ul[^>]*>', '', text)
    text = re.sub(r'</ol>', '\n', text)
    text = re.sub(r'<ol[^>]*>', '', text)
    text = re.sub(r'<br\s*/?>', '\n', text)
    text = re.sub(r'</?tbody[^>]*>', '', text)
    text = re.sub(r'<[^>]+>', '', text)
    
    # Entities
    for enc in [('&#8216;',"'"),('&#8217;',"'"),('&#8220;','"'),('&#8221;','"'),
                ('&amp;','&'),('&#038;','&'),('&nbsp;',' '),
                ('&rsquo;',"'"),('&lsquo;',"'"),('&rdquo;','"'),('&ldquo;','"'),
                ('&aacute;','á'),('&eacute;','é'),('&oacute;','ó'),('&#8211;','-')]:
        text = text.replace(*enc)
    
    # Clean bold on non-table lines
    lines = text.split('\n')
    result = []
    for line in lines:
        if line.strip().startswith('|'):
            result.append(line)
        else:
            result.append(clean_bold(line))
    text = '\n'.join(result)
    
    text = re.sub(r'\n{4,}', '\n\n\n', text)
    return text.strip()

# Filter Untitled
posts = [p for p in posts if p['title']['rendered'].strip() not in ('Untitled', '')]
print(f"Posts: {len(posts)}")

by_year = defaultdict(list)
for p in posts:
    yr = year_map.get((p.get('pyq-year') or [None])[0], '')
    title = p['title']['rendered']
    for a,b in [('&#8216;',"'"),('&#8217;',"'"),('&#8220;','"'),('&#8221;','"'),('&amp;','&'),('&#038;','&')]:
        title = title.replace(a, b)
    by_year[yr].append({'title': title, 'content': p['content']['rendered']})

OUT = 'app/public'
with open(f'{OUT}/PWOnlyIAS_GS4_Answers.md', 'w', encoding='utf-8') as f:
    f.write('# PWOnlyIAS GS Paper IV - Ethics, Integrity and Aptitude\n\n## UPSC Mains Solved Questions with Answers\n\n---\n\n')
    for year in sorted(by_year.keys(), reverse=True):
        f.write(f'# {year}\n\n')
        for i, q in enumerate(by_year[year]):
            f.write(f'## Question {i+1}\n\n{q["title"]}\n\n### Answer\n\n{html_to_md(q["content"])}\n\n---\n\n')

sz = os.path.getsize(f'{OUT}/PWOnlyIAS_GS4_Answers.md')
total = sum(len(v) for v in by_year.values())
print(f"Main: {total}Q, {sz} bytes")

sdir = f'{OUT}/pwias_split'
if os.path.exists(sdir): shutil.rmtree(sdir)
os.makedirs(sdir)
for year in sorted(by_year.keys(), reverse=True):
    for i, q in enumerate(by_year[year]):
        with open(os.path.join(sdir, f'GS4_PW_{year}_Q{i+1}.md'), 'w', encoding='utf-8') as f:
            f.write(f'## Question (Year: {year} | Paper: GS IV)\n\n{q["title"]}\n\n### Answer\n\n{html_to_md(q["content"])}\n')
print(f"Splits: {total} files")

# Verify
s = open(f'{OUT}/PWOnlyIAS_GS4_Answers.md').read()
print(f"****: {s.count('****')}")
print(f"|**: {s.count('|**')}")
print(f"**|: {s.count('**|')}")
sp = len(re.findall(r'\*\* [a-zA-Z(]', s))
print(f"** text: {sp}")
print("Done!")