import argparse
import bibtexparser

parser = argparse.ArgumentParser()
parser.add_argument('-bibentry', '-b', type=str, default='', help='Bibtex entry to be converted to IEEE format')
parser.add_argument('--input', '-i', type=str, default='', help='Path to the input bibtex file, e.g., ./pubs_list.bib')
parser.add_argument('--output', '-o', type=str, default='./pubs_list_converted.md')
args = parser.parse_args()


def get_pretty_bibstr(entry):
    key = entry.get('ID', '')
    entry_type = entry.get('ENTRYTYPE', '')
    
    bibstr = f"@{entry_type}{{{key},#[br]\n"
    for field_key, field_value in entry.items():
        if field_key not in ['ID', 'ENTRYTYPE']:
            bibstr += f"&emsp;{field_key} = {{{field_value}}},#[br]\n"
    bibstr += "}"
    return bibstr

# Name abbreviation (e.g. "John Doe" -> "J. Doe")
def abbreviate_author_name(author_name):
    if ', ' in author_name:
        parts = author_name.split(', ')
    else: 
        parts = author_name.split(' ')
    # print(author_name)
    # print(parts)
    if len(parts) > 1:
        if ', ' in author_name:
            sur_name = parts[0]
            given_name = parts[-1]
        else:
            sur_name = parts[-1]
            given_name = parts[0]
        return given_name[0] + '. ' + sur_name
    else:
        return author_name

# Convert bibtex entry to IEEE format
def convert_to_ieee(bibtex_entry):
    authors = ''
    title = ''
    journal = ''
    year = ''
    volume = ''
    number = ''
    pages = ''

    if 'author' in bibtex_entry:
        names_str = bibtex_entry['author']
        names = names_str.split(' and ')
        new_names = [abbreviate_author_name(name) for name in names if name != 'others']
        if len(new_names) == 1:
            authors = new_names[0]
        else:
            authors = ', '.join(new_names[:-1]) + ' and ' + new_names[-1]
    if 'title' in bibtex_entry:
        title = bibtex_entry['title']
    if 'journal' in bibtex_entry:
        journal = bibtex_entry['journal'].title()
        if 'Ieee' in journal:
            journal = journal.replace('Ieee', 'IEEE')
        if 'On' in journal:
            journal = journal.replace('On ', 'on ')
        if 'Of' in journal:
            journal = journal.replace('Of ', 'of ')
        if 'And' in journal:
            journal = journal.replace('And ', 'and ')
        if 'In' in journal:
            journal = journal.replace('In ', 'in ')
        if 'Acm ' in journal:
            journal = journal.replace('Acm ', 'ACM ')
    if 'year' in bibtex_entry:
        year = bibtex_entry['year']
    if 'volume' in bibtex_entry:
        volume = bibtex_entry['volume']
    if 'number' in bibtex_entry:
        number = bibtex_entry['number']
    if 'pages' in bibtex_entry:
        pages = bibtex_entry['pages']
    
    ieee_citation = f"{authors}, \"{title}\", in {journal}, vol. {volume}, no. {number}, pp. {pages}, {year}."
    return ieee_citation


# test
# s = get_pretty_bibstr(library.entries[0])
# print(s)


if __name__ == '__main__':
    if args.input and args.output: 
        # Example from https://bibtexparser.readthedocs.io/en/main/quickstart.html#prerequisite-vocabulary
        with open(args.input, 'r') as bibtex_file:
            library = bibtexparser.load(bibtex_file)
        total_blocks = len(library.entries) + len(library.comments) + len(library.strings) + len(library.preambles)
        print(f"Parsed {total_blocks} blocks, including:"
        f"\n\t{len(library.entries)} entries"
            f"\n\t{len(library.comments)} comments"
            f"\n\t{len(library.strings)} strings and"
            f"\n\t{len(library.preambles)} preambles")
        # write to ouput
        with open(args.output, 'w') as f:
            for entry in library.entries:
                f.write(get_pretty_bibstr(entry))
                f.write("\n\n")
    else: # no input specified, do some other task
        bibentry = args.bibentry
        library = bibtexparser.loads(bibentry)
        print(convert_to_ieee(library.entries[0]))