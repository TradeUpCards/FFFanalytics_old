import json

# Function to pretty-print a JSON file
def pretty_print_json(input_file, output_file):
    try:
        with open(input_file, 'r') as infile:
            data = json.load(infile)
        
        with open(output_file, 'w') as outfile:
            json.dump(data, outfile, indent=4)
        
        print(f"Pretty-printed JSON has been saved to {output_file}")
    except Exception as e:
        print(f"An error occurred: {e}")

# Example usage
input_file = 'missionresults.json'
output_file = 'missionresults_pretty.json'  # Replace with your desired output file name

pretty_print_json(input_file, output_file)
