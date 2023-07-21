import argparse
import bibtexparser

parser = argparse.ArgumentParser()
parser.add_argument('--input', type=str, default='./pubs_list.bib')
parser.add_argument('--output', type=str, default='./pubs_list_converted.md')
args = parser.parse_args()

# Example from https://bibtexparser.readthedocs.io/en/main/quickstart.html#prerequisite-vocabulary
library = bibtexparser.parse_file(args.input)

print(f"Parsed {len(library.blocks)} blocks, including:"
  f"\n\t{len(library.entries)} entries"
    f"\n\t{len(library.comments)} comments"
    f"\n\t{len(library.strings)} strings and"
    f"\n\t{len(library.preambles)} preambles")

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

# test
# s = get_pretty_bibstr(library.entries[0])
# print(s)

# write to output
with open(args.output, 'w') as f:
    for entry in library.entries:
        f.write(get_pretty_bibstr(entry))
        f.write("\n\n")