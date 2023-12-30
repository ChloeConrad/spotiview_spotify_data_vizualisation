import json


users = {'elliot':['2019_0','2019-2020_1','2020_2','2020-2021_3','2021_4','2021-2022_5','2022_6','2022-2023_7','2023_8'],
      'elodie':['2016-2022_0','2022-2023_1'] }
for user in users.keys() :
    occurencesArtists = {}
    occurencesTracks = {}
    occurencesGenres = {}
    
    for file in users[user] :
        with open('datasets/raw/'+user+'/Streaming_History_Audio_'+file+'.json', 'r') as fichier_json:
            data = json.load(fichier_json)
        for elem in data :
            if elem['master_metadata_track_name'] in occurencesTracks :
                occurencesTracks[elem['master_metadata_track_name']] += 1
            else :
                occurencesTracks[elem['master_metadata_track_name']] = 1

            if elem['master_metadata_album_artist_name'] in occurencesArtists :
                occurencesArtists[elem['master_metadata_album_artist_name']] += 1
            else :
                occurencesArtists[elem['master_metadata_album_artist_name']] = 1

    
    with open('datasets/tracks/artists_'+user+'.json', 'r') as fichier_json:
            data = json.load(fichier_json)
    for elem in data :
        if elem['name'] in occurencesArtists :
            for genre in elem['genres'] :
                if genre in occurencesGenres :
                    occurencesGenres[genre] += occurencesArtists[elem['name']]
                else :
                    occurencesGenres[genre] = occurencesArtists[elem['name']]

    # Ouvrez le fichier en mode écriture
    with open('datasets/occurences/occurences_artists_'+user+'.json', 'w') as fichier_json:
        # Écrivez le dictionnaire dans le fichier JSON
        json.dump(occurencesArtists, fichier_json, indent=2)

    # Ouvrez le fichier en mode écriture
    with open('datasets/occurences/occurences_genres_'+user+'.json', 'w') as fichier_json:
        # Écrivez le dictionnaire dans le fichier JSON
        json.dump(occurencesGenres, fichier_json, indent=2)

    # Ouvrez le fichier en mode écriture
    with open('datasets/occurences/occurences_tracks_'+user+'.json', 'w') as fichier_json:
        # Écrivez le dictionnaire dans le fichier JSON
        json.dump(occurencesTracks, fichier_json, indent=2)