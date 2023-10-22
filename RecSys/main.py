import logging

logging.disable(logging.CRITICAL)

import flask
from urllib.parse import quote as url_quote
from ampligraph.utils import restore_model
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = flask.Flask(__name__)
#app.secret_key = 'secret_key'

@app.get("/")
def hello():
    """The app is working!"""
    return "Hello World!"

@app.get("/get_top_10_matches/<name>")
def get_top_10_predictions(name):
    """Return the top 10 predictions for a given name."""
    # Load the embeddings from complex_graph_student_embeddings.npy
    print("Downloading embeddings...")
    complex_graph_student_embeddings = np.load('complex_graph_student_embeddings.npy')
    # Load the model from test_model.pkl
    print("Downloading dataframe...")
    df = pd.read_csv('combined_table.csv')
    print("Downloading model...")
    model = restore_model('test_model.pkl')
    def getTop10(student):
        embedding = model.get_embeddings([student])
        distances = []
        
        for i in range(len(complex_graph_student_embeddings)):
            other_embedding = complex_graph_student_embeddings[i].reshape(1,300)
            distances.append(cosine_similarity(embedding, other_embedding)[0][0])
        distances = np.array(distances)
        indexes = distances.argsort()[-11:][:1:-1]
        enterprises = df["Name"].tolist()
        top10 = []
        for index in indexes:
            top10.append(enterprises[index])
        return top10[1:]
    print("Getting top 10...")
    response = getTop10(name)
    print("response")
    return flask.jsonify(response)
    

if __name__ == "__main__":
    # Used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host="localhost", port=8080, debug=True)