#!/usr/bin/env python3
"""
Efficient extractor: GS4 from Google Docs HTML to clean Markdown.
Uses line-oriented parsing for speed on large files.
"""

import re, os

with open('source.html', 'r', encoding='utf-8') as f:
    html = f.read()

OUT = '/home/engine/project/app/public'
os.makedirs(OUT, exist_ok=True)

def txt(html_chunk):
    """Extract text with **bold** markers."""
    r = html_chunk
    r = re.sub(r'<span[^>]*style="font-weight:bold;"[^>]*>', '**', r)
    r = re.sub(r'<span[^>]*>', '', r)
    r = r.replace('</span>', '')
    r = re.sub(r'<br\s*/?>', '\n', r)
    r = re.sub(r'</?[a-z][^>]*>', '', r)
    r = r.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&quot;', '"')
    r = r.replace('&lt;', '<').replace('&gt;', '>').replace('&#39;', "'")
    r = re.sub(r' +', ' ', r)
    # Fix punctuation bold: **.** -> .
    r = re.sub(r'\*\*([.,;:!?)\]}])', r'\1', r)
    r = re.sub(r'([.,;:!?)\]}\-])\*\*', r'\1', r)
    r = r.replace('** **', ' ')
    r = r.replace('****', '')
    return r.strip()

def bold_heading(text):
    """Check if text should be a ### heading."""
    t = re.sub(r'\*\*(.*?)\*\*', r'\1', text).strip()
    kws = ['Way Forward','Way forward','Conclusion','Introduction','Challenges',
           'Remedial','Measures','Solutions','Impacts','Impact','Ethical issues',
           'Stakeholders','Options available','Key values','Values involved',
           'Ethical considerations','Ethical dilemmas','Significance','Importance',
           'Role of','Suggestion','Counter-argument','Pros and cons','Evaluation',
           'Action plan','Steps for','Measures to','Recommendations','Background',
           'Analysis','Ethical Issues Involved','Stakeholders Involved',
           'Ethical dilemmas involved','Ethical Factors','Ethical positives',
           'Ethical Care','Ethical & Professional','Corporate Greed',
           'Reasons for','Preventing','No, resignation','For You',
           'For the','For the Colleague','Justifications','My reaction',
           'Ethical Issues Arising','Balanced ethical','Pros of','Cons of',
           'Response to','Evaluation of','Importance of','Pillars',
           'Other Pillars','Consequences of','NEP 2020','Role of major',
           'War is','Business Level','Society Level','Citizen Level',
           'Ethical issues in','To complete','Guiding Principle']
    for kw in kws:
        if t.startswith(kw) and len(t) < 100:
            return True
    if len(t) < 60 and t[0].isupper() and (' - ' in t or '–' in t):
        return True
    return False

# -------- SPLIT AT CASE STUDIES --------
cs_marker = 'Case Studies</span></h4>'
cs_idx = html.find(cs_marker)
theory_html = html[:cs_idx] if cs_idx > 0 else html

# -------- FIND ALL h2 BOUNDARIES IN THEORY (FAST) --------
# Use simple string search for h2 tags
h2_positions = []
search_start = 0
while True:
    h2_start = html.find('<h2 ', search_start) if search_start >= 0 else -1
    if h2_start == -1:
        h2_start = html.find('<h2>', search_start) if search_start >= 0 else -1
    if h2_start == -1:
        break
    h2_end = html.find('</h2>', h2_start)
    if h2_end == -1:
        break
    h2_positions.append((h2_start, h2_end + 5))
    search_start = h2_end + 5

print(f"Found {len(h2_positions)} h2 tags")

if not h2_positions:
    print("ERROR: No h2 tags found!")
    exit(1)

# ---- EXTRACT H2 CONTENT AND ANSWER CONTENT ----
# Only process h2 tags that contain a year
def has_year(text):
    return bool(re.search(r'\b20(?:1[89]|2[0-5])\b', text))

q_blocks = []
for i, (h2s, h2e) in enumerate(h2_positions):
    h2_inner = html[h2s:h2e]
    h2_clean = txt(h2_inner)
    
    if not has_year(h2_clean):
        continue
    
    # End of answer content
    if i < len(h2_positions) - 1:
        ans_end = h2_positions[i+1][0]
    else:
        ans_end = len(html)
    
    ans_html = html[h2e:ans_end]
    
    yr_match = re.search(r'\b(20(?:1[89]|2[0-5]))\b', h2_clean)
    year = yr_match.group(1) if yr_match else "Unknown"
    
    q_blocks.append({
        'year': year,
        'h2_clean': h2_clean,
        'ans_html': ans_html,
    })

print(f"Found {len(q_blocks)} question blocks")

# ---- CONVERT ANSWER HTML TO MARKDOWN ----
def html_to_md(ans_html):
    """Convert HTML answer content to clean markdown."""
    lines_out = []
    
    # Process elements in order using regex
    # We need to handle h3, p, ul, div
    elements = []
    pos = 0
    while pos < len(ans_html):
        # Find next tag
        tag_match = re.search(r'<(h[1-6]|p|ul|div|img)\b[^>]*>', ans_html[pos:])
        if not tag_match:
            break
        
        tag = tag_match.group(1)
        tag_start = pos + tag_match.start()
        tag_end_tag = pos + tag_match.end()
        
        if tag == 'img':
            # Find self-closing or up to >
            img_end = ans_html.find('>', tag_start)
            if img_end > tag_start:
                img_tag = ans_html[tag_start:img_end+1]
                elements.append(('img', img_tag, ''))
                pos = img_end + 1
            else:
                pos = tag_start + 1
            continue
        
        # For regular tags, find closing tag
        close_tag = f'</{tag}>'
        close_pos = ans_html.find(close_tag, tag_end_tag)
        if close_pos == -1:
            pos = tag_start + 1
            continue
        
        inner = ans_html[tag_end_tag:close_pos]
        elements.append((tag, '', inner))
        pos = close_pos + len(close_tag)
    
    for tag, _, inner in elements:
        if tag == 'h3':
            t = txt(inner)
            if t and len(t) > 2:
                t_clean = re.sub(r'\*\*(.*?)\*\*', r'\1', t)
                lines_out.append(f'### {t_clean}\n')
        elif tag == 'p':
            t = txt(inner)
            if t and len(t) > 2:
                if bold_heading(t):
                    t_clean = re.sub(r'\*\*(.*?)\*\*', r'\1', t)
                    lines_out.append(f'### {t_clean}\n')
                else:
                    lines_out.append(f'{t}\n')
        elif tag == 'ul':
            for li in re.findall(r'<li>(.*?)</li>', inner, re.DOTALL):
                t = txt(li)
                if t and len(t) > 2:
                    # Extract number if present
                    num_m = re.match(r'^(\d+\.?)\s+', t)
                    if num_m:
                        t = t[num_m.end():]
                    t = t.lstrip('•- ')
                    cl = re.sub(r'\*\*(.*?)\*\*', r'\1', t).strip()
                    if bold_heading(cl) and len(cl) < 60:
                        lines_out.append(f'### {cl}\n')
                    else:
                        lines_out.append(f'1. {t}\n')
        elif tag == 'div':
            # Check for images
            for img_m in re.finditer(r'<img[^>]*src="([^"]*)"', inner):
                src = img_m.group(1)
                img_name = os.path.basename(src).replace(' ', '_')
                img_dir = '/home/engine/project/solved paper/civilsdaily/images'
                os.makedirs(img_dir, exist_ok=True)
                src_path = 'GS 4 Model Answers (2018-2025)_files/' + os.path.basename(src)
                if os.path.exists(src_path):
                    import shutil
                    try:
                        shutil.copy2(src_path, os.path.join(img_dir, img_name))
                        lines_out.append(f'![Diagram](images/{img_name})\n')
                    except:
                        pass
    
    return ''.join(lines_out)

# ---- PROCESS ALL QUESTIONS ----
all_output = []
for q in q_blocks:
    md_ans = html_to_md(q['ans_html'])
    md_ans = re.sub(r'\n{3,}', '\n\n', md_ans)
    
    all_output.append({
        'year': q['year'],
        'question': q['h2_clean'],
        'answer': md_ans,
    })

print(f"Processed {len(all_output)} questions")

# ---- WRITE OUTPUT ----
out_path = os.path.join(OUT, 'GS4_Model_Answers.md')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write('# UPSC Civil Services Main Examination\n\n')
    f.write('## GS Paper IV - Ethics, Integrity and Aptitude\n\n')
    f.write('### Model Answers (2018-2025)\n\n')
    f.write('---\n')
    f.write('\n*Source: Civilsdaily IAS*\n\n')
    f.write('---\n\n')
    
    for i, q in enumerate(all_output):
        year = q['year']
        num = i + 1
        f.write(f'## Question {num} (Year: {year} | Paper: GS IV)\n\n')
        f.write(f'{q["question"]} [Year: {year}] [Marks: 10]\n\n')
        f.write('### Answer\n\n')
        f.write(q['answer'])
        f.write('\n---\n\n')

fsize = os.path.getsize(out_path)
print(f"Written to {out_path} ({fsize} bytes)")

# Also write individual files
split_dir = os.path.join(OUT, 'split')
os.makedirs(split_dir, exist_ok=True)
for i, q in enumerate(all_output):
    year = q['year']
    num = i + 1
    fpath = os.path.join(split_dir, f'GS4_Q{num}_{year}.md')
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(f'## Question {num} (Year: {year} | Paper: GS IV)\n\n')
        f.write(f'{q["question"]} [Year: {year}] [Marks: 10]\n\n')
        f.write('### Answer\n\n')
        f.write(q['answer'])
        f.write('\n---\n')

print(f"Written {len(all_output)} individual files in {split_dir}")
print("DONE!")