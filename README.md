# TIB-AV-A Frontend

## TODOs

- [x] Initialize layout for video analysis
- [x] Develop components for face detection(rectangles), graphs for face area visualization and other UI starter inputs
- [x] Bind graph and rectangles with data from backend
- [x] Face rectangles and current play position pointer alignment
- [x] Dockerize with suitable base Image
- [x]  Checkbox bindings
- [ ] Show annotaiton values and oppurtunity to udpate this via user input
- [ ] Loading and computational blocker to show the progress
- [ ] dynamic face rectangle location align if browser resized
- [ ] Zoom in video content and annotaiotns accoridngly
- [ ] story lines with shot boundaries and with color scheme


## Installation

Clone the project with all services using

```bash
git clone git@git.tib.eu:tib-av-a/frontend.git
```


To install and start the frontend run:

```bash
docker-compose -f "docker-compose.yml" up -d --build
```

You can manually start the frontend with:

```bash
npm install
npm start
```
