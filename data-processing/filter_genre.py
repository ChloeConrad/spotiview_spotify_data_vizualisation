import json

def clean_artist(data_artists, genre_occurences, artists_occ) :
    artists_genre = {}
    for l in data_artists :
        genre_occ = {}
        artist = l["name"]
        for genre in l["genres"] :
            if genre in genre_occurences :
                genre_occ[genre] = genre_occurences[genre]
        genre_occ = {k: v for k, v in sorted(genre_occ.items(), key=lambda item: item[1], reverse=True)}
        if len(list(genre_occ.keys())) >0 :
            artists_genre[artist] = {"genre" : list(genre_occ.keys())[0]}
            if artist in artists_occ :
                artists_genre[artist]["occurence"] = artists_occ[artist]
    return artists_genre


f = open('../datasets/tracks/artists_elliot.json', encoding="UTF-8")
data_artists_elliot = json.load(f)
f.close()
f = open('../datasets/occurences/occurences_genres_elliot.json')
occurences_genre_elliot = json.load(f)
f.close()
f = open('../datasets/occurences/occurences_artists_elliot.json')
artists_occ_elliot = json.load(f)

artists_genre_elliot = clean_artist(data_artists_elliot, occurences_genre_elliot, artists_occ_elliot)

with open("../datasets/tracks/clean_artists_elliot.json", "w") as outfile: 
    json.dump(artists_genre_elliot, outfile)
    
f = open('../datasets/tracks/artists_elodie.json', encoding="UTF-8")
data_artists_elodie = json.load(f)
f.close()
f = open('../datasets/occurences/occurences_genres_elodie.json')
occurences_genre_elodie = json.load(f)
f.close()
f = open('../datasets/occurences/occurences_artists_elodie.json')
artists_occ_elodie = json.load(f)

artists_genre_elodie = clean_artist(data_artists_elodie, occurences_genre_elodie, artists_occ_elodie)

with open("../datasets/tracks/clean_artists_elodie.json", "w") as outfile: 
    json.dump(artists_genre_elodie, outfile)