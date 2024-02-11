import argparse
import bibtexparser

parser = argparse.ArgumentParser()
parser.add_argument('bibentry', type=str, help='Bibtex entry to be converted to IEEE format')
parser.add_argument('--input', type=str, default='', help='Path to the input bibtex file, e.g., ./pubs_list.bib')
parser.add_argument('--output', type=str, default='./pubs_list_converted.md')
args = parser.parse_args()


def get_pretty_bibstr(entry):
    key = entry.key
    entry_type = entry.entry_type
    # fields_dict = entry.fields_dict
    fields = entry.fields
    
    bibstr = f"@{entry_type}{{{key},#[br]\n"
    for field in fields:
        bibstr += f"&emsp;{field.key} = {{{field.value}}},#[br]\n"
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

    fields  = bibtex_entry.fields
    for field in fields:
        if field.key == 'author':
            names_str = field.value
            names = names_str.split(' and ')
            new_names = [abbreviate_author_name(name) for name in names if name != 'others']
            if len(new_names) == 1:
                authors = new_names[0]
            else:
                authors = ', '.join(new_names[:-1]) + ' and ' + new_names[-1]
        elif field.key == 'title':
            title = field.value
        elif field.key == 'journal':
            journal = field.value.title()
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
        elif field.key == 'year':
            year = field.value
        elif field.key == 'volume':
            volume = field.value
        elif field.key == 'number':
            number = field.value
        elif field.key == 'pages':
            pages = field.value
    
    ieee_citation = f"{authors}, \"{title}\", in {journal}, vol. {volume}, no. {number}, pp. {pages}, {year}."
    return ieee_citation


# test
# s = get_pretty_bibstr(library.entries[0])
# print(s)


if __name__ == '__main__':
    if args.input: 
        # Example from https://bibtexparser.readthedocs.io/en/main/quickstart.html#prerequisite-vocabulary
        library = bibtexparser.parse_file(args.input)
        print(f"Parsed {len(library.blocks)} blocks, including:"
        f"\n\t{len(library.entries)} entries"
            f"\n\t{len(library.comments)} comments"
            f"\n\t{len(library.strings)} strings and"
            f"\n\t{len(library.preambles)} preambles")
        # write to ouput
        if args.output:
            with open(args.output, 'w') as f:
                for entry in library.entries:
                    f.write(get_pretty_bibstr(entry))
                    f.write("\n\n")

    bibentry = args.bibentry
    library = bibtexparser.parse_string(bibentry)
    print(convert_to_ieee(library.entries[0]))