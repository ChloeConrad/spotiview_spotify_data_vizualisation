import json 
import os

json_data_elliot = []
json_data_elodie = []
for filename in os.listdir("../datasets/raw/elliot") :
    if ".json" in filename :
        f = open('../datasets/raw/elliot/'+filename, encoding="UTF-8")
        data = json.load(f)
        json_data_elliot.extend(data)
        f.close()

for item in json_data_elliot:
    del item['username']
    del item['platform']
    del item['conn_country']
    del item['ip_addr_decrypted']
    del item['user_agent_decrypted']
    del item['episode_name']
    del item['episode_show_name']
    del item['spotify_episode_uri']
    del item['incognito_mode']
    del item['offline_timestamp']
    
with open("../datasets/tracks/streaming_history_elliot.json", "w") as f:
    json.dump(json_data_elliot, f)

for filename in os.listdir("../datasets/raw/elodie") :
    if ".json" in filename :
        f = open('../datasets/raw/elodie/'+filename, encoding="UTF-8")
        data = json.load(f)
        json_data_elodie.extend(data)
        f.close()

for item in json_data_elodie:
    del item['username']
    del item['platform']
    del item['conn_country']
    del item['ip_addr_decrypted']
    del item['user_agent_decrypted']
    del item['episode_name']
    del item['episode_show_name']
    del item['spotify_episode_uri']
    del item['incognito_mode']
    del item['offline_timestamp']
    
with open("../datasets/tracks/streaming_history_elodie.json", "w") as f:
    json.dump(json_data_elodie, f)
