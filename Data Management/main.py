import PyPDF2
import requests
url = "http://127.0.0.1:8080"
def upload_doc(filename:str)->str:
    def chunks(iterable, batch_size=100):
        """A helper function to break an iterable into chunks of size batch_size."""
        for i in range(0, len(iterable), batch_size):
            yield iterable[i:i + batch_size]
    def process_chunk(chunk, id, filename):
        """A helper function to process a chunk of data."""
        filename = filename[:-4]
        pages = []
        for page in chunk:
            data = page.extract_text()
            data = data.replace('\n', '')
            # Make filename lowercase, ascii, and replace spaces with (-) hyphens
            filename = filename.lower().replace(" ", "-").encode("ascii", "ignore").decode("ascii")
            pageObj = {
                "data": data,
                "id": filename + "-pg-" + str(id),
            }
            #print(data)
            pages.append(pageObj)
            id += 1
        # Send the chunk to the server
        request = {
            "index": "akai",
            "inputs": pages,
            #"section": sections,
        }
        response = requests.post(url+"/develop/vectorize-input",verify=False, json=request)
        print(response.json())
    input_file = filename
    batch_size = 10
    pdfFileObj = open(input_file, 'rb')
    pdfReader = PyPDF2.PdfReader(pdfFileObj)
    pageObj = pdfReader.pages
    id = 0
    for chunk in chunks(pageObj, batch_size=batch_size):
        process_chunk(chunk, id, input_file)
        print("-" * 80)
        print("Done processing chunk #" + str(id))
        print("-" * 80)
        id += batch_size
    pdfFileObj.close()

import os
# Iterate over the files in the current directory + /data
if not os.path.exists("data"):
    os.makedirs("data")
os.chdir("data")
# Get the list of processed files
processed_files = []
if not os.path.exists("processed_files.txt"):
    open("processed_files.txt", "w+")
with open("processed_files.txt", "r", encoding="utf-8") as f:
    processed_files = f.readlines()
    processed_files = [x.strip() for x in processed_files]
for filename in os.listdir(os.getcwd()):
    if filename.endswith(".pdf"):
        if filename in processed_files:
            continue
        print("Processing file: " + filename)
        upload_doc(filename)
        # Save the processed file names in a txt file. UTF-8 encoding is used to avoid errors.
        with open("processed_files.txt", "a+", encoding="utf-8") as f:
            f.write(filename + "\n")
        continue
    else:
        continue
print("Done processing all files in the directory.")