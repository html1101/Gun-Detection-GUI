# Scrape info from the file GUNS.txt or NO-GUNS.txt.
import requests
import os
import threading

VERSION = "GUNS"

print(F"Matching length: {len(os.listdir('Dataset/Guns'))}")

leng = len(os.listdir("Dataset/No Guns")) - len(os.listdir("Dataset/Guns"))

dir = "Dataset/Guns"
dfs = open(F"{VERSION}.txt", "r").read().split("\n") # list(filter(lambda x: "staticflickr" in x, pd.read_excel("social_media_inf.xlsx", sheet_name=None)["data"]["hyperlink_text"]))

max_threads = 20
num_links = 0

def downloadLink(links, path, thread):
    # Download a list of links to a path
    global num_links
    for link in links:
        if num_links >= leng:
            # Stopped
            print(F"Stopping thread {thread}: Max links downloaded.")
            return
        img_data = requests.get(link).content
        img_link = F"GUN_PIC_{num_links}" # link.split("/")[-1].split("?")[0]
        if img_link:
            img_name = F"GUN_PIC_{num_links}" # link.split("/")[-1].split("?")[0]
            print(F"Saving link {img_name} to {path}/{img_name}.jpeg")
            if num_links >= leng:
                # Stopped
                print(F"Downloaded matching number of links: {num_links} out of {leng}")
                return
            open(F"{path}/{img_name}.jpeg", "wb").write(img_data)
            num_links += 1
    print(F"Stopping thread {thread}: Finished reading {len(links)} links.")

num_at_once = 80
# Start multithreaded downloading process
if __name__ == "__main__":
    # Create n threads
    threads = []
    for i in range(max_threads):
        t = threading.Thread(target=downloadLink, args=(dfs[int(i*num_at_once) : int((i+1)*num_at_once)], dir, i,))
        t.start()
        print(F"Starting thread {i}.")
        threads.append(t)
    
    # Wait for threads to finish
    for i in threads:
        i.join()
    print("Finished execution.")