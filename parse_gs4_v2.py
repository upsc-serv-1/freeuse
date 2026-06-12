#!/usr/bin/env python3
"""
Robust GS4 parser. Handles Google Docs HTML with proper formatting.
"""

import re, os, shutil

with open('source.html', 'r', encoding='utf-8') as f:
    html = f.read()

OUT = '/home/engine/project/app/public'
os.makedirs(OUT, exist_ok=True)

def txt(chunk):
    """Extract clean text preserving bold markers from HTML."""
    # Replace bold spans entirely: <span ...bold...>content</span> -> **content**
    r = re.sub(r'<span[^>]*style="font-weight:bold;"[^>]*>(.*?)</span>', r'**\1**', chunk)
    # Remove all remaining span/open tags
    r = re.sub(r'<span[^>]*>', '', r)
    r = r.replace('</span>', '')
    r = re.sub(r'<br\s*/?>', '\n', r)
    r = re.sub(r'</?[a-zA-Z][^>]*>', '', r)
    r = r.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&quot;', '"')
    r = r.replace('&lt;', '<').replace('&gt;', '>').replace('&#39;', "'")
    # Collapse multiple spaces
    r = re.sub(r' +', ' ', r)
    # Strip whitespace INSIDE bold markers, preserving external spacing
    # ** content ** -> space_before**content**space_after
    def clean_bold(m):
        content = m.group(1)
        before = ' ' if content.startswith(' ') else ''
        after = ' ' if content.endswith(' ') else ''
        return before + '**' + content.strip() + '**' + after
    r = re.sub(r'\*\*(.+?)\*\*', clean_bold, r)
    # Clean up empty bold
    r = r.replace('****', '').replace('** **', ' ')
    return r.strip()

def is_heading_tag(tag_str):
    """Check if tag string is an h3 tag."""
    return re.match(r'<h3\b', tag_str) is not None

def is_para_tag(tag_str):
    return re.match(r'<p\b', tag_str) is not None or tag_str == '<p>'

def is_ul_tag(tag_str):
    return re.match(r'<ul\b', tag_str) is not None or tag_str == '<ul>'

def is_table_tag(tag_str):
    return re.match(r'<table\b', tag_str) is not None

def has_year(text):
    return bool(re.search(r'\b20(?:1[89]|2[0-5])\b', text))

# -------- SPLIT --------
cs_marker = 'Case Studies</span></h4>'
cs_idx = html.find(cs_marker)
theory_html = html[:cs_idx] if cs_idx > 0 else html

# -------- FIND h2 BOUNDARIES --------
h2_positions = []
search_start = 0
while True:
    h2_start = html.find('<h2 ', search_start)
    if h2_start == -1:
        h2_start = html.find('<h2>', search_start)
    if h2_start == -1:
        break
    h2_end = html.find('</h2>', h2_start)
    if h2_end == -1:
        break
    h2_positions.append((h2_start, h2_end + 5))
    search_start = h2_end + 5

# ---- Extract Q&A pairs ----
q_blocks = []
for i, (h2s, h2e) in enumerate(h2_positions):
    h2_text = txt(html[h2s:h2e])
    if not has_year(h2_text):
        continue
    
    ans_end = h2_positions[i+1][0] if i < len(h2_positions) - 1 else len(html)
    ans_html = html[h2e:ans_end]
    
    yr_m = re.search(r'\b(20(?:1[89]|2[0-5]))\b', h2_text)
    year = yr_m.group(1) if yr_m else "Unknown"
    
    q_blocks.append({'year': year, 'question': h2_text, 'ans_html': ans_html})

def process_answer(ans_html):
    """Process answer HTML to markdown."""
    out_lines = []
    pos = 0
    
    while pos < len(ans_html):
        # Skip whitespace
        if pos < len(ans_html) and ans_html[pos] in ' \t\n\r':
            pos += 1
            continue
        
        # Find next meaningful tag
        tag_m = re.search(r'<(h[1-6]|p|ul|ol|table|div)\b[^>]*>', ans_html[pos:])
        if not tag_m:
            break
        
        tag_str = tag_m.group(0)
        tag_name = tag_m.group(1)
        tag_start_inner = pos + tag_m.end()
        
        # Find closing tag
        close_tag = f'</{tag_name}>'
        close_pos = ans_html.find(close_tag, tag_start_inner)
        if close_pos == -1:
            pos = tag_start_inner
            continue
        
        inner = ans_html[tag_start_inner:close_pos]
        elem_end = close_pos + len(close_tag)
        
        if tag_name in ('h1', 'h2'):
            pos = elem_end
            continue
        
        elif tag_name == 'h3':
            text = txt(inner)
            if text:
                text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
                out_lines.append(f'### {text}')
        
        elif tag_name == 'p':
            text = txt(inner)
            if text and len(text) > 2:
                # Handle images inside p
                img_m = re.search(r'<img[^>]*src="([^"]*)"', ans_html[tag_start_inner-100:elem_end])
                if img_m:
                    src = img_m.group(1)
                    img_name = os.path.basename(src).replace(' ', '_')
                    dest_dir = '/home/engine/project/solved paper/civilsdaily/images'
                    os.makedirs(dest_dir, exist_ok=True)
                    src_path = 'GS 4 Model Answers (2018-2025)_files/' + os.path.basename(src)
                    if os.path.exists(src_path):
                        try:
                            shutil.copy2(src_path, os.path.join(dest_dir, img_name))
                        except:
                            pass
                
                # Check if this is actually an h3 subheading in bold
                bold_text = re.sub(r'\*\*(.*?)\*\*', r'\1', text).strip()
                if len(bold_text) < 80 and bold_text[0:1].isupper():
                    # Check if it looks like a subheading
                    subheading_kws = ['Importance of', 'Role of', 'Dimensions of', 'Way Forward',
                        'Conclusion', 'Challenges', 'Measures', 'Solutions', 'Impacts',
                        'Impact', 'Ethical issues', 'Stakeholders', 'Options',
                        'Values', 'Significance', 'Suggestion', 'Counter',
                        'Pros', 'Cons', 'Evaluation', 'Action', 'Steps',
                        'Recommendations', 'Background', 'Analysis', 'Corporate',
                        'Reasons', 'Consequences', 'Guiding', 'Empowerment',
                        'Pillars', 'NEP', 'Other', 'Consequences of']
                    is_sub = False
                    for kw in subheading_kws:
                        if bold_text.startswith(kw):
                            is_sub = True
                            break
                    if is_sub:
                        out_lines.append(f'### {bold_text}')
                        pos = elem_end
                        continue
                
                out_lines.append(text)
        
        elif tag_name == 'ul':
            # Find all <li> elements
            li_pos = 0
            while True:
                li_m = re.search(r'<li>(.*?)</li>', inner[li_pos:], re.DOTALL)
                if not li_m:
                    break
                li_text = txt(li_m.group(1))
                li_pos += li_m.end()
                if not li_text:
                    continue
                
                # Check for nested bold headings
                bold_clean = re.sub(r'\*\*(.*?)\*\*', r'\1', li_text).strip()
                if len(bold_clean) < 70:
                    sub_kws = ['Corporate Greed', 'The Justice', 'The Accountability', 
                              'The Sustainability', 'Solving the', 'Builds']
                    is_sub = False
                    for kw in sub_kws:
                        if bold_clean.startswith(kw):
                            is_sub = True
                            break
                    if is_sub:
                        out_lines.append(f'### {bold_clean}')
                        continue
                
                # Handle bold markers directly after number
                li_clean = li_text.strip()
                # Detect numbering (allow ** right after number or number inside **)
                num_match = re.match(r'^\*{0,2}(\d+)\.\**\s*', li_clean)
                letter_match = re.match(r'^\*{0,2}([a-z])\.\**\s*', li_clean)
                
                if num_match:
                    out_lines.append(li_clean)
                elif letter_match:
                    out_lines.append(f'    {li_clean}')
                elif li_clean.startswith('•') or li_clean.startswith('-'):
                    out_lines.append(f'- {li_clean[1:].strip()}')
                else:
                    out_lines.append(f'- {li_clean}')
        
        elif tag_name == 'table':
            # Convert HTML table to markdown
            rows = re.findall(r'<tr>(.*?)</tr>', inner, re.DOTALL)
            md_table = []
            for ri, row in enumerate(rows):
                cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
                md_cells = [txt(c) for c in cells]
                md_table.append('| ' + ' | '.join(md_cells) + ' |')
                if ri == 0:
                    md_table.append('| ' + ' | '.join(['---'] * len(md_cells)) + ' |')
            if md_table:
                out_lines.extend(md_table)
        
        elif tag_name == 'div':
            # Check for images
            img_found = False
            for img_m in re.finditer(r'<img[^>]*src="([^"]*)"', inner):
                src = img_m.group(1)
                img_name = os.path.basename(src).replace(' ', '_')
                dest_dir = '/home/engine/project/solved paper/civilsdaily/images'
                os.makedirs(dest_dir, exist_ok=True)
                src_path = 'GS 4 Model Answers (2018-2025)_files/' + os.path.basename(src)
                if os.path.exists(src_path):
                    try:
                        shutil.copy2(src_path, os.path.join(dest_dir, img_name))
                        out_lines.append(f'![Diagram](images/{img_name})')
                        img_found = True
                    except:
                        pass
        
        pos = elem_end
    
    result = '\n\n'.join(out_lines)
    result = re.sub(r'\n{3,}', '\n\n', result)
    return result

# ---- Process all Q&A ----
all_output = []
for q in q_blocks:
    md_ans = process_answer(q['ans_html'])
    all_output.append({'year': q['year'], 'question': q['question'], 'answer': md_ans})

# ---- WRITE OUTPUT ----
out_path = os.path.join(OUT, 'GS4_Model_Answers.md')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write('# UPSC Civil Services Main Examination\n\n## GS Paper IV - Ethics, Integrity and Aptitude\n\n### Model Answers (2018-2025)\n\n---\n\n*Source: Civilsdaily IAS*\n\n---\n\n')
    for i, q in enumerate(all_output):
        year = q['year']
        num = i + 1
        f.write(f'## Question {num} (Year: {year} | Paper: GS IV)\n\n')
        f.write(f'**Question ID: {year}-gs4-q{num}-civilsdaily**\n\n')
        f.write(f'{q["question"]} [Year: {year}] [Marks: 10]\n\n')
        f.write('### Answer\n\n')
        f.write(q['answer'])
        f.write('\n\n---\n\n')

print(f"Done: {len(all_output)} questions, {os.path.getsize(out_path)} bytes")

# Individual files
split_dir = os.path.join(OUT, 'split')
os.makedirs(split_dir, exist_ok=True)
for i, q in enumerate(all_output):
    year = q['year']
    num = i + 1
    fpath = os.path.join(split_dir, f'GS4_Q{num}_{year}.md')
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(f'## Question {num} (Year: {year} | Paper: GS IV)\n\n')
        f.write(f'**Question ID: {year}-gs4-q{num}-civilsdaily**\n\n')
        f.write(f'{q["question"]} [Year: {year}] [Marks: 10]\n\n')
        f.write('### Answer\n\n')
        f.write(q['answer'])
        f.write('\n---\n')

# Copy to solved paper dir
dest_dir = '/home/engine/project/solved paper/civilsdaily'
os.makedirs(dest_dir, exist_ok=True)
shutil.copy2(out_path, os.path.join(dest_dir, 'GS4_Model_Answers.md'))
print("Complete!")