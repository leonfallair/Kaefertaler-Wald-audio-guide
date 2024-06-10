// Connection to Basemaps DE
const baseMaps = {
  "Basemap DE Farbig": {
    style: "https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_col.json"
  },
  "Basemap DE Grau": {
    style: "https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_gry.json"
  },
  "Relief": {
    style: "https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_top.json"
  }
};

// Basemap Farbig as first basemap
const initialStyle = baseMaps["Basemap DE Farbig"].style;

// Map setup
const map = new maplibregl.Map({
  container: 'map',
  style: initialStyle,
  center: [8.5140882, 49.5366096], // Coordinates of Mannheim/Kaefertaler Wald
  zoom: 14,
});

// Thumbnail generation
function createThumbnail(styleUrl, callback) {
  const miniMapContainer = document.createElement('div');
  miniMapContainer.style.width = '200px';
  miniMapContainer.style.height = '200px';
  miniMapContainer.style.position = 'absolute';
  miniMapContainer.style.top = '-9999px';
  document.body.appendChild(miniMapContainer);

  const miniMap = new maplibregl.Map({
    container: miniMapContainer,
    style: styleUrl,
    center: [8.5140882, 49.5366096], 
    zoom: 10,
    interactive: false,
  });

  miniMap.on('load', () => {
    miniMap.resize();
    setTimeout(() => {
      const canvas = miniMap.getCanvas();
      const dataUrl = canvas.toDataURL('image/png');
      callback(dataUrl);
      miniMap.remove();
      document.body.removeChild(miniMapContainer);
    }, 500);
  });
}

class layerSwitcherControl {
  constructor(options) {
    this._options = { ...options };
    this._container = document.createElement("div");
    this._container.classList.add(
      "maplibregl-ctrl",
      "maplibregl-ctrl-basemaps",
      "closed"
    );

    switch (this._options.expandDirection || "right") {
      case "top":
        this._container.classList.add("reverse");
        break;
      case "down":
        this._container.classList.add("column");
        break;
      case "left":
        this._container.classList.add("reverse");
        break;
      case "right":
        this._container.classList.add("row");
    }

    this._container.addEventListener("mouseenter", () => {
      this._container.classList.remove("closed");
    });
    this._container.addEventListener("mouseleave", () => {
      this._container.classList.add("closed");
    });
  }

  onAdd(map) {
    this._map = map;
    const basemaps = this._options.basemaps;

    Object.keys(basemaps).forEach((layerId) => {
      const base = basemaps[layerId];
      const basemapContainer = document.createElement("div");
      basemapContainer.classList.add("basemap");
      basemapContainer.dataset.id = layerId;

      createThumbnail(base.style, (dataUrl) => {
        const basemapImage = document.createElement("img");
        basemapImage.src = dataUrl;
        basemapImage.alt = layerId;
        basemapImage.classList.add("basemap-thumbnail");
        basemapContainer.appendChild(basemapImage);

        const basemapLabel = document.createElement("div");
        basemapLabel.textContent = layerId;
        basemapLabel.classList.add("basemap-label");
        basemapContainer.appendChild(basemapLabel);
      });

      basemapContainer.addEventListener("click", () => {
        const activeElement = this._container.querySelector(".active");
        if (activeElement) {
          activeElement.classList.remove("active");
        }
        basemapContainer.classList.add("active");
        this._map.setStyle(base.style);
      });

      this._container.appendChild(basemapContainer);

      if (this._options.initialBasemap === layerId) {
        basemapContainer.classList.add("active");
      }
    });

    return this._container;
  }

  onRemove() {
    this._container.parentNode?.removeChild(this._container);
    delete this._map;
  }
}

map.addControl(
  new layerSwitcherControl({
    basemaps: baseMaps,
    initialBasemap: "Basemap DE Farbig",
  }),
  "bottom-left"
);

// popups with respective functions are defined
function createMarkerAndPopup(imageSrc, lngLat, gallery, galleryDescriptions, title, description, audioSrc) {
    const image = document.createElement('img');
    image.src = imageSrc;
    image.className = 'marker-image';
    image.style.width = '32px';
    image.style.height = '32px';

    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';

    let currentImageIndex = 0;

    const popupImage = document.createElement('img');
    popupImage.src = gallery[currentImageIndex];
    popupImage.className = 'popup-image';
    popupImage.style.width = '32px';
    popupImage.style.height = '32px';
    popupContent.appendChild(popupImage);

    const imageDescription = document.createElement('p');
    imageDescription.textContent = galleryDescriptions[currentImageIndex];
    imageDescription.className = 'image-description';
    imageDescription.style.display = 'none';
    popupContent.appendChild(imageDescription);

    const stationText = document.createElement('strong');
    stationText.textContent = title;
    popupContent.appendChild(stationText);

    const moreInfoButton = document.createElement('p');
    moreInfoButton.textContent = 'Mehr erfahren';
    moreInfoButton.className = 'moreinfo-button';
    popupContent.appendChild(moreInfoButton);

    const welcomeText = document.createElement('div');
    welcomeText.innerHTML = description;
    welcomeText.style.display = 'none';
    welcomeText.className = 'welcome-text';
    popupContent.appendChild(welcomeText);

    const audioElement = document.createElement('audio');
    audioElement.src = audioSrc;
    audioElement.controls = true;
    audioElement.style.display = 'none';
    popupContent.appendChild(audioElement);

    const audioParagraph = document.createElement('p');
    popupContent.appendChild(audioParagraph);

    const playButton = document.createElement('button');
    playButton.textContent = 'Audio abspielen';
    playButton.className = 'audio-button';
    popupContent.appendChild(playButton);
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = 'X';

    closeButton.addEventListener('click', function() {
        if (popupImage && imageDescription) {
            popupImage.style.width = '32px';
            popupImage.style.height = '32px';
            imageDescription.style.display = 'none';
    
            if (closeButton.parentNode) {
                closeButton.parentNode.removeChild(closeButton);
            }
        }
    });

    popupImage.addEventListener('click', function() {
        if (popupImage.style.width === '32px') {
            popupImage.style.width = '100%';
            popupImage.style.height = '300px';
            popupImage.style.cursor = 'pointer';
            imageDescription.style.display = 'block';

            if (!closeButton.parentNode) {
                popupImage.parentNode.appendChild(closeButton);
            }
        } else {
            currentImageIndex = (currentImageIndex + 1) % gallery.length;
            popupImage.src = gallery[currentImageIndex];
            imageDescription.textContent = galleryDescriptions[currentImageIndex];
            popupImage.style.width = '100%';
            popupImage.style.height = '300px';
        }
    });

    moreInfoButton.addEventListener('click', function() {
        if (welcomeText.style.display === 'none') {
            welcomeText.style.display = 'block';
        } else {
            welcomeText.style.display = 'none';
        }
    });

    playButton.addEventListener('click', function() {
        audioElement.play();
    });

    new maplibregl.Marker({ element: image })
        .setLngLat(lngLat)
        .addTo(map)
        .setPopup(new maplibregl.Popup().setDOMContent(popupContent));
}
// locations with coordinates and content are defined
const locations = [
{
imageSrc: 'images/KtW.jpg',
lngLat: [8.513828, 49.536785],
gallery: ['images/KtW.jpg', 'images/KtW_Station_2.jpg', '/images/zusatzbild.jpg'],
galleryDescriptions: ['Karlstern Pavillion', 'Beschreibung für Bild 2', '3D ÜBeschreibung für Bild 3'],
title: 'Station 1: Auf geht\'s in den Käfertaler Wald!',
description: 'Herzlich Willkommen bei unserer Audioguidetour im Käfertaler Wald. Schön dass Sie hier sind! An insgesamt 10 Stationen erfahren Sie alles Wissenswerte zu unserem Stadtwald und wie es ihm aktuell geht. Eine Übersichtskarte der einzelnen Stationen und auch den Routenverlauf fnden Sie auf unserer Homepage <a href="https://www.mannheim.de/de/service-bieten/gruene-stadt/wald" target="_blank">mannheim.de/wald</a>. Die Tour ist etwa 3,5 km lang und dauert - mit Verweilzeiten – ca. 2 bis 2,5 Stunden. Und jetzt: wünschen wir Ihnen viel Spaß beim Rundgang Nun bewegen wir uns etwas weg vom Trubel am Karlstern. Bitte folgen Sie der Kastanienallee bis zum Vogelpark. Dort geht es los mit der Station zum Thema Entwicklung des Stadtwaldes.',
audioSrc: 'Audio/Test.mp3'
},
{
imageSrc: 'images/KtW_Station_2.jpg',
lngLat: [8.513168, 49.538550],
gallery: ['images/KtW.jpg', 'images/KtW_Station_2.jpg'],
galleryDescriptions: ['Beschreibung für Bild 1', 'Beschreibung für Bild 2'],
title: 'Station 2: Warum sieht der Stadtwald so aus wie heute?',
description: 'Wie ist unser Stadtwald in Mannheim entstanden, und so geworden wie wir ihn heute kennen?<br /> Mannheim ist von über 1.800 Hektar Wald umgeben. Der heutige Stadtwald entstand aus Wäldern der eingemeindeten Orte.<br /> In vielen unserer Mannheimer Wälder war lange die Kiefer die Baumart der Wahl. Das lag einerseits an den nährstoffarmen und trockenen Böden. Für diese ist die Kiefer gut geeignet. Zum anderen nutzte man die Wälder hauptsächlich zur Brennholzgewinnung. Der Wald wurde auch als Waldweide genutzt und die Streu auf dem Boden für die Einstreu in landwirtschaftlichen Betrieben. Die Tiere im Wald aßen am liebsten die Blätter der Laubbäume. Darum sind nur wenige Laubbäume gewachsen, und stattdessen viele Kiefern.<br /> Durch den 2. Weltkrieg inklusive militärischer Nutzung des Waldes und auch aufgrund größerer Waldbrände in den 70er Jahren, verlor der Wald an Größe. Diese Flächen wurden im Anschluss neu bepflanzt. Wieder mit Kiefern, aber auch mit Laubbaumarten. Diese Pflanzungen von damals prägen das Waldbild in vielen Bereichen noch heute:  Der Käfertaler Wald ist ein in vielen Bereichen recht junger Wald mit der Kiefer als seiner Hauptbaumart. <br /> Aktuell besteht der Mannheimer Stadtwald zu 43 % aus Kiefern und zu 57 % aus Laubbäumen. Zu den Laubbäumen zählen vor allem Eichen, Buchen, Ahorn und Robinien. Seit den 50er Jahren des letzten Jahrhunderts breitet sich verstärkt auch die Spätblühende Traubenkirsche aus, eine nicht heimische invasive Art. Mehr Informationen darüber hören Sie an Station 4. <br /> ... und dann ist da noch der globale Klimawandel. Er hinterlässt auch in unserem Stadtwald seine Spuren.  Welche Auswirkungen der Klimawandel auf den Wald hat, erfahren Sie an der nächsten Station.<br /> Bitte folgen Sie nun der Kastanienallee bis zur nächsten Station, an der Wegkreuzung Kastanienallee / Weg Nr. 7. Danach geht es weiter auf dem Weg Nr. 7. Wir hören uns gleich wieder.',
audioSrc: 'Audio/Test.mp3'
},
{
imageSrc: 'images/KtW_Station_3.jpg',
lngLat: [8.513235, 49.540955],
gallery: ['images/KtW.jpg', 'images/KtW_Station_2.jpg'],
galleryDescriptions: ['Beschreibung für Bild 1', 'Beschreibung für Bild 2'],
title: 'Station 3: Auswirkungen des Klimawandels auf den Wald',
description: 'Wir befinden uns nun an der Wegkreuzung Kastanienallee / weg nr. 7. Die Route geht weiter in Richtung Weg 7 bis zur Kreuzung mit Weg Nr. 6. Diesem folgen Sie bitte nach links. <br /> Beim Laufen durch den Wald sind Ihnen vielleicht einige abgestorbene Bäume aufgefallen? Das sind leider die Auswirkungen des Klimawandels auf unseren Wald. Die Trockenheit und Hitze der letzten Jahre lässt viele Bäume absterben. <br /> Wie entwickelt sich nun das Klima in Mannheim? Und was ist überhaupt so problematisch für den Wald?<br /> Mannheim liegt in einer sehr warmen und trockenen Region. Wir können es alle selbst spüren: es wird immer heißer und im Sommer regnet es immer weniger. Klimaexpertinnen und -experten gehen davon aus, dass es in Mannheim künftig noch mehr Tage mit extremer Hitze geben wird. Auch die Niederschläge im Sommer werden wohl weiter zurückgehen. Die Jahre 2017 bis 2021 waren bereits ein Vorgeschmack... Man geht zwar im Allgemeinen davon aus, dass der jährliche Niederschlag weiter ausreicht. Aber dieser fällt nun neuerdings vor allem im Winter. In den Jahren 2017 bis 2021 hat es aber auch im Winter zu wenig geregnet. Die Wasserspeicher im Boden wurden nicht ausreichend aufgefüllt. Eine schlechte Ausgangslage für trockene und heiße Sommer und die Wasserversorgung unserer Bäume. <br /> Die Auswirkungen der höheren Temperaturen und der geringeren Niederschläge auf die Bäume sind gravierend!<br /> Unsere Waldbäume müssen mit den neuen klimatischen Bedingungen zurechtkommen. Oder sie sterben über kurz oder lang ab. Generell sind Waldökosysteme schon in der Lage sich an Veränderungen anzupassen. Allerdings benötigt so ein Generationswechsel einen sehr, sehr langen Zeitraum. Wir sprechen hier von 200 Jahren oder sogar noch länger. Bäume wachsen nun mal recht langsam. Deshalb dauert es auch lange bis sich eine neue Waldgeneration eingestellt hat. Die Umweltbedingungen an extremen Standorten wie Mannheim ändern sich jedoch rasant. Unser Wald hat somit kaum eine Chance sich aus eigener Kraft schnell genug anzupassen. <br /> Was passiert also aktuell mit unseren Waldbäumen hier im Käfertaler Wald? <br /> Manche Baumarten leiden mehr unter Trockenheit und Hitze als andere. Bei uns betrifft es besonders die Kiefer und die Buche. Die Bäume sind durch die Trockenheit gestresst und geschwächt. Das macht sie anfälliger für Insekten und Pilzerkrankungen. <br /> Die Kiefer, unsere Hauptbaumart in Mannheim, ist eine Baumart der Extreme. Sie müsste mit der Trockenheit eigentlich sehr gut zurechtkommen. Bis zum Extremwetterjahr 2018 war das auch so. Erst die Kombination von extremer Trockenheit, außergewöhnlich vielen Extremhitzetagen und ausbleibenden Winterniederschlägen schwächte die Kiefer. Und diese Schwächung führt wiederum zu Stress und so zu Anfälligkeit für Folgeerkrankungen.<br /> Das sog. „Diplodiatriebsterben“ ist eine solche stressbedingte Folgeerkrankung. Dabei befällt der Diplodiapilz die Nadel der Kiefer. Das können wir ganz einfach erkennen an den braunen abgestorbenen Nadeln. An gestressten Bäumen breitet sich der Pilz besonders schnell aus. Die Nadeln des Baumes sterben ab und damit ist der komplette Baum zum Absterben verurteilt. An einem geschwächten Baum hat auch der Borkenkäfer leichtes Spiel. Er durchbohrt die Rinde und schädigt mit den Fraßgängen die Leitungsbahnen, mit denen die Bäume Wasser aus dem Boden in die Krone transportieren. Das hält dann kein Baum mehr aus. Der Diplodiapilz und der Borkenkäfer sorgen aktuell für ein großflächiges Absterben der Kiefer im Wald. Schauen Sie selbst in die Baumkronen, es ist nicht zu übersehen.<br /> Auch die Buchen leiden unter der Trockenheit und Hitze. Experten schätzen den Fortbestand der Buche in der Rheinebene und damit auch im Käfertaler Wald als kritisch ein. Langfristig wird sie in ihrem bisherigen Umfang wohl nicht weiter Teil unserer Waldbestände bleiben. Dafür ist es nun einfach zu trocken und zu warm. <br /> Unter den Baumarten sind es vor allem die mit kleiner Krone, die besonders unter der Trockenheit leiden und ausfallen. Daher ist es wichtiger denn je, die Bäume zu vitalen Exemplaren mit einer großen Krone zu entwickeln, die meist auch ein weiter verzweigtes und größeres Wurzelsystem haben. <br /> An der nächsten Station geht es darum, wie die Stadt Mannheim den Auswirkungen des Klimawandels begegnet. Gehen Sie dazu nun weiter auf dem Weg Nr. 7 bis zur Kreuzung mit Weg Nr. 6. Diesem folgen Sie bitte nach links bis Sie die Pflanzfläche an der Kastanienallee erreichen. Auf dem Weg dorthin schauen Sie doch noch mal nach oben in die Baumkronen, hier bekommen Sie einen guten Eindruck vom Zustand des Waldes.',
audioSrc: 'Audio/Test.mp3'
},
{
imageSrc: 'images/KtW_Station_4.jpg',
lngLat: [8.510525, 49.544585],
gallery: ['images/KtW.jpg', 'images/KtW_Station_2.jpg'],
galleryDescriptions: ['Beschreibung für Bild 1', 'Beschreibung für Bild 2'],
title: 'Station 4: Warum werden Bäume gepflanzt',
description: 'Wir stehen hier vor einer Pflanzfläche im Käfertaler Wald. Es sind viele junge Bäume und verschiedene Baumarten zu sehen und die Fläche ist eingezäunt. Lassen Sie uns die Pflanzfläche über die Kastanienallee mal kurz umrunden, bis wir wieder auf Weg Nr. 6 kommen. Dann haben wir einen besseren Blick.<br /> Warum werden hier nun Bäume gepflanzt? <br /> Grundsätzlich wird im Mannheimer Stadtwald das Ziel verfolgt, naturnahe, klimastabile Mischwälder zu entwickeln, die vor allem aus Laubbäumen bestehen sollen. Die Baumarten orientieren sich dabei an der natürlichen Waldgesellschaft, also den Baumarten, die natürlicherweise dort vorkommen würden. Berücksichtigt werden hier die Standorteignung und die klimatische Entwicklung.<br /> Deshalb werden dort wo besonders viele Bäume vom Absterben betroffen sind, nun neue Bäume gepflanzt. Das sind Flächen, auf denen die Kiefer größtenteils abstirbt und wo kaum klimastabile Laubbaumarten vorhanden sind. Und außerdem Flächen, auf denen der starke Bewuchs und die Beschattung durch die Spätblühende Traubenkirsche eine natürliche Verjüngung von Laubbaumarten verhindert. Also nur die Stellen im Wald, auf denen die ausgewachsenen Bäume absterben und klimastabile Baumarten sich nicht vermehren können.<br /> Neu gepflanzt werden dann klimastabile, standortangepasste und vor allem verschiedene Laubbaumarten, wie z.B. Eichen, Ahorn oder die Kirsche. Diese Mischung macht es sehr unwahrscheinlich, dass eines Tages eine Baumart ausfällt und dann plötzlich kein Wald mehr vorhanden ist. Was im Moment mit der Kiefer und mit unserem gesamten Wald passiert, darf sich nicht wiederholen!!!<br /> Dieser Prozess wird in Mannheim jährlich auf einem halben Prozent der Stadtwaldfläche umgesetzt. Also nur auf einem sehr kleinen Teil!<br /> Die Pflanzflächen müssen zunächst für die Pflanzung vorbereitet werden. Das heißt als erstes wird die Spätblühende Traubenkirsche entfernt. Dadurch bekommen die lichtbedürftigen Baumarten endlich mehr Sonne ab und haben nun auch einen deutlichen Wuchsvorsprung bevor die Spätblühende Traubenkirsche aus Wurzelstücken oder Kirschkernen erneut austreibt. Da der Boden nun teilweise freiliegt, kann auch die Kiefer wieder keimen. Und auch andere Baumarten verjüngen sich, sobald die Spätblühende Traubenkirsche entfernt ist.<br /> Der Zaun um die Pflanzfläche ist für die Wildschweine und Rehe. Sie müssen draußen bleiben, damit sich die jungen Bäume innerhalb des Zauns ungestört entwickeln können. Sie werden nicht von Wildschweinen ausgegraben oder von Rehen verbissen. Und so entwickelt sich ein bunt gemischter klimastabiler Wald. <br /> Die Flächen werden in den Jahren nach der Pflanzung auch weiterhin gepflegt und von der Spätblühenden Traubenkirsche befreit. So behalten auch langsam wachsende Baumarten, wie zum Beispiel die Eiche, ihren Wuchsvorsprung.  <br /> Hintergrund und Motivation der forstlichen Arbeit im Mannheimer Stadtwald ist der langfristige und dauerhafte Erhalt des Erholungswaldes und die Förderung der Artenvielfalt. <br /> Es ist die große Herausforderung der nächsten Jahre und Jahrzehnte, den Wald zu erhalten und die Biodiversität zu fördern. Die Herausforderung den Wald fit zu machen für unser neues Klima. <br /> Weiter geht es nun wieder mit Weg 6, zurück dahin wo wir hergekommen sind. Dort erfahren wir etwas über die Baumarten der Zukunft.',
audioSrc: 'Audio/Test.mp3'
},
{
imageSrc: 'images/KtW_Station_5.jpg',
lngLat: [8.511115, 49.5440003],
gallery: ['images/KtW.jpg', 'images/KtW_Station_2.jpg'],
galleryDescriptions: ['Beschreibung für Bild 1', 'Beschreibung für Bild 2'],
title: 'Station 5: Zukunftsbaumarten',
description: 'Welche Baumarten haben nun eine Zukunft bei uns? Welche kommen mit den klimatischen Bedingungen zurecht?<br /> Wenn wir nun neue Bäume pflanzen ist es wichtig, dass die ausgesuchten Baumarten das uns bevorstehende Klima auch aushalten. Sie müssen zurechtkommen mit trockenen Sommern, wenig Niederschlag und Hitzetagen. <br /> Die Eiche, gemischt mit anderen Laubbaumarten, ist für solche trockenwarmen Wälder gut geeignet. An den meisten Standorten des Mannheimer Stadtwaldes kommt die Eiche auch schon natürlicherweise vor. <br /> Man setzt aber nicht alle Hoffnungen auf nur eine Baumart. Das Risiko muss gestreut werden. So dass wenn eine Baumart ausfallen würde immer noch genügend andere vorhanden sind. Darum werden bei den Pflanzungen verschiedene Baumarten gemischt und generell immer mehr als drei Arten auf die Fläche gesetzt. <br /> Auch die Kiefer als „Baumart der Zukunft“ wird weiterhin dazugehören. Sie ist eine typische Baumart für trockenwarme Standorte und Sandböden so wie wir sie hier in Mannheim haben. <br /> Grundsätzlich wählt und mischt man Baumarten, die unterschiedliche Anpassungen und Reaktionen auf klimatische Veränderungen zeigen können. Auf diese Weise werden mehrere klimatische Szenarien abgedeckt - das Risiko eines kompletten Waldverlustes sinkt. Diese Mischung ist Voraussetzung für die Entwicklung eines gesunden, ökologisch wertvollen und klimastabilen Mischwaldes. <br /> Wir gehen nun weiter auf Weg Nr. 6. Dabei erfahren wir etwas über die Spätblühende Traubenkirsche.',
audioSrc: 'Audio/Test.mp3'
},
{
imageSrc: 'images/KtW.jpg',
lngLat: [8.5143958, 49.5427572],
gallery: ['images/KtW.jpg', 'images/KtW_Station_2.jpg'],
galleryDescriptions: ['Beschreibung für Bild 1', 'Beschreibung für Bild 2'],
title: 'Station 6: Die Spätblühende Traubenkirsche',
description: 'Wir bewegen uns jetzt auf Weg Nr. 6 Richtung „Neue Poststraße“. Wenn Sie beim Hören der nächsten Station mal nach links und rechts blicken, werden Sie den flächendeckenden Bewuchs der Traubenkirsche sehen. <br /> Wir haben nun schon einiges über die Spätblühende Traubenkirsche gehört. Was ist das denn für eine Pflanze? <br /> Die Spätblühende Traubenkirsche ist ein sogenannter „Neophyt“. Neophyten sind Pflanzen, deren Lebensraum eigentlich ganz woanders ist. Aber nun breiten sie sich in unserem heimischen Lebensraum aus und verdrängen hier andere Pflanzen weil sie besser wachsen. Diese Neophyten wurden in der Neuzeit aus vielen Teilen der Welt zu uns gebracht. Entweder ganz beabsichtigt, um sie in Parkanlagen, Gärten oder im Wald zu pflanzen. Oder aber auch unbeabsichtigt, indem die Samen zum Beispiel über Frachtschiffe nach Deutschland kamen. So sind viele Pflanzen als blinde Passagiere hierher gereist. Problematisch wird es dann, wenn die Neophyten unsere heimischen Pflanzen aus ihrem natürlichen Lebensraum verdrängen.<br /> Im Käfertaler Wald kommt die Spätblühende Traubenkirsche mittlerweile flächendeckend vor. Sie wächst rasch und verdunkelt den Boden unter sich. Wir Waldbesuchende nehmen die Spätblühende Traubenkirsche auf den ersten Blick gar nicht als störend war. Sie sorgt dafür, dass unser Wald grün ist und dass uns die absterbenden Bäume in den höheren Etagen nicht so auffallen. Problematisch ist allerdings, dass die Spätblühende Traubenkirsche anderen Baumarten das Licht wegnimmt. Viele Laubbaumarten, z.B. die Eiche, sind sehr lichtbedürftig und konkurrieren mit anderen Pflanzen um das Licht am Waldboden. Zum Heranwachsen braucht die Eiche Licht, sonst können keine neuen Bäume wachsen. Da die Spätblühende Traubenkirsche aber viel schneller wächst als heimische Baumarten ist sie beim Kampf ums Licht klar im Vorteil. <br /> Aber was macht die Spätblühende Traubenkirsche so invasiv? Warum breitet sie sich so stark aus?<br /> Die Blätter und Knospen der Spätblühenden Traubenkirsche werden nicht von Rehen gefressen. Sie haben Blausäure eingelagert und schmecken den Tieren deshalb nicht. Die Baumart kommt außerdem gut mit der Trockenheit im Mannheimer Wald zurecht. Sie wächst schnell und verdunkelt den Boden unter sich. Die Spätblühende Traubenkirsche ist der große Gewinner der klimatischen Änderungen im Wald - auf Kosten unserer heimischen Baum- und Straucharten. <br /> Was können wir nun dagegen tun?<br /> Effektiv hilft nur das Ausgraben oder Ausreißen mit der Wurzel, denn bei uns im Stadtwald werden keine chemischen Produkte eingesetzt. Um die Biodiversität und unsere heimischen Arten zu fördern, wird die Spätblühende Traubenkirsche auf den Pflanzflächen entfernt. So bekommen die neu gepflanzten Bäume einen deutlichen Wuchsvorsprung und dominieren später einmal die Spätblühende Traubenkirsche. Auf diese Weise entstehen natürliche Waldbereiche mit einer reichen Artenvielfalt. <br /> Zur nächsten Station folgen Sie bitte weiter dem Weg Nr. 6 bis zur Kreuzung mit der „Neuen Poststraße“. Dort erfahren Sie etwas über eine Baumart der Zukunft, die Eiche.',
audioSrc: 'Audio/Test.mp3'
},
{
imageSrc: 'images/KtW.jpg',
lngLat: [8.5170145, 49.5417836],
gallery: ['images/KtW.jpg', 'images/KtW_Station_2.jpg'],
galleryDescriptions: ['Beschreibung für Bild 1', 'Beschreibung für Bild 2'],
title: 'Station 7: Die Eiche als Zukunftsbaum',
description: 'Hier gibt es links und rechts der „Neuen Poststraße“ einige alte Exemplare der Eiche. Was macht die Eichen bei uns im Käfertaler Wald eigentlich so wichtig?<br /> Die Eiche ist für die Artenvielfalt eine ganz besondere Baumart. An keiner anderen Baumart siedeln sich so viele verschiedene heimische Arten an. Alte Eichen sind also ein unglaublicher Hotspot für Artenvielfalt. Aus Artenschutzsicht ist es deshalb sinnvoll, ja sogar alternativlos, die Verjüngung und das Wachstum von Eichen zu fördern. <br /> Die Eiche ist gut geeignet den Klimaveränderungen in unserem Wald standzuhalten. Artenschutz und die Entwicklung eines klimastabilen Waldes machen es erforderlich, den Eichenanteil zu erhöhen. Der Weg von einer kleinen Eichel bis zu einer alten dicken Eiche ist allerdings lang. Die Verjüngung von Eichen ist aufwändig und schwierig: Eicheln werden von vielen Tieren gefressen. Zum Keimen und Heranwachsen benötigen die jungen Eichen viel Licht. Die Bäume werden sehr gern von Rehen angeknabbert und Wildschweine graben auf der Suche nach Engerlingen die jungen Pflanzen aus. Die Blätter sind anfällig für den Befall von Pilzen wie Mehltau. Und es gibt eine harte Konkurrenz um das Sonnenlicht durch schneller wachsende Baumarten und krautige Pflanzen. <br /> Um den Eichenanteil im Käfertaler Wald zu erhöhen, ist einiges an Pflegearbeit nötig. Alte klimastabile Eichen als Zukunftsbaumart in Mannheim, müssen auch mal jung gewesen sein. Dafür sind pflegerische Maßnahmen wie Pflanzflächen und Auflichtungen von Waldbeständen notwendig. <br /> Weiter geht es nun auf der Verlängerung von Weg Nr. 6 geradeaus, bis wir auf die Kreuzung mit Weg Nr. 1 treffen. Dort geht es um das Alt- und Totholzkonzept im Käfertaler Wald.',
audioSrc: 'Audio/Test.mp3'
},
{
imageSrc: 'images/KtW.jpg',
lngLat: [8.5202727, 49.5405688],
gallery: ['images/KtW.jpg', 'images/KtW_Station_2.jpg'],
galleryDescriptions: ['Beschreibung für Bild 1', 'Beschreibung für Bild 2'],
title: 'Station 8: Naturschutz im Wald',
description: 'Schon bemerkt? Überall im Wald stehen abgestorbene Bäume. Und auch auf dem Boden liegen einige umgestürzte Bäume. Warum werden die wohl nicht weggeräumt? Diese Bäume im Käfertaler Wald sind Teil des Waldnaturschutzes. Hier sehen wir das Alt- und Totholzkonzept der Stadt Mannheim. Ziel ist es, die charakteristische biologische Vielfalt des Stadtwaldes zu erhalten und weiter zu entwickeln. Artenschutz im Wald beinhaltet eine breite Themenvielfalt: Gefährdete Tier- und Pflanzenarten schützen. Lebensgemeinschaften und die genetische Vielfalt innerhalb der Arten erhalten und fördern. Seltene Waldstandorte bewahren. Die naturnahe Waldentwicklung fördern. Alles in allem eine große Herausforderung. Unser Alt- und Totholzkonzept ist ein wesentlicher Teil des Artenschutzes im Wald. Totholz wird absichtlich im Wald belassen. Bis zur vollständigen Zersetzung bleiben einige abgestorbenen Bäume im Wald stehen. Oder liegen. Viele Pflanzen, Pilze und Tiere brauchen dieses verrottende Holz zum Leben. Sie nutzen es als Unterschlupf, als Brutplatz oder Nahrung. Solche besonderen Orte, die sogenannten Habitatbäume, schaffen wir mit dem Alt- und Totholz. Die Habitatbäume werden mit einer umlaufenden Wellenlinie am Stamm markiert. Unsere Revierleiter prüfen bei der Vorbereitung auf die Holzernte jeden Baum. Dabei werden einzelne Habitatbäume oder auch Gruppen ausgewiesen. Man achtet dabei auf typische Merkmale wie Höhlen von Spechten, Lebensraum für Höhlenbrüter, Fledermäuse oder Wildbienen, sowie Vogelnester in den Kronen.  Die Habitatbäume und -baumgruppen dienen auch zur Vernetzung der Waldlebensräume. Sie sind so etwas wie Trittsteine für viele Arten, um sich auch in andere Waldbereiche auszubreiten. Im Durchschnitt liegt der Anteil an Totholz bei uns im Mannheimer Stadtwald deutlich über 30 Festmeter pro Hektar. Ein Hektar, das entspricht in etwa einem großen Fußballfeld. Auf diesem Feld stellen wir uns nun 7 Litfaßsäulen vor oder 30 große Müllcontainer. Das ist das Volumen des Totholzes pro Hektar. Diese Größenordnung entspricht auch der Empfehlung des Bundesamtes für Naturschutz und liegt über dem bundesweiten Durchschnitt.  Wir wollen im Stadtwald den Anteil an Totholz noch deutlich erhöhen und damit noch mehr wertvollen Lebensraum schaffen. Aktuell passiert dies ganz von selbst durch die vielen absterbenden Bäume. Aber auch gezielt durch die neu ausgewiesenen Waldrefugien, in denen alle landwirtschaftliche Nutzung unterbleibt zugunsten des Artenschutzes. Wir haben uns bewusst dazu entscheiden, den Anteil an Wäldern von natürlicher, ungelenkter Waldentwicklung in Mannheim zu erhöhen. Zur nächsten Station folgen Sie rechts dem Weg Nr. 1. Dort gibt es Informationen zum Boden im Mannheimer Wald.',
audioSrc: 'Audio/Test.mp3'
},
{
imageSrc: 'images/KtW.jpg',
lngLat: [8.5197143, 49.5392526],
gallery: ['images/KtW.jpg', 'images/KtW_Station_2.jpg'],
galleryDescriptions: ['Beschreibung für Bild 1', 'Beschreibung für Bild 2'],
title: 'Station 9: Der Waldboden',
description: 'Schon mehrfach haben wir die Standortbedingungen im Wald angesprochen. Klima und Boden bestimmen, welche Pflanzen und Bäume bei uns im Stadtwald wachsen können. So ein Waldboden ist viel mehr als nur Erde. Er ist durchsetzt mit Wasser, Luft und Lebewesen. Er versorgt die Pflanzen mit Nährstoffen und verankert deren Wurzeln. Die Entstehung der Böden hat Jahrtausende gedauert. Sie beginnt mit dem Abbau von Gestein durch Wasser, Wind und andere Wettereinflüsse. Das Gestein aus dem die Böden in Mannheim entstanden sind, stammt vom Rhein. Der Rhein hat hier nach der letzten Eiszeit vor ca. 12.000 Jahren Kies und Sand abgelagert. Wenn das abgelagerte Gestein verwittert, führt dies zur Bildung von unterschiedlichen Bodenhorizonten, die parallel zur Erdoberfläche verlaufen. Jeder Boden hat also eine klassische Schichtung, gut erkennbar in den Aufschlüssen und Löchern der umgestürzten Bäume am Wegrand. Über diesen Bodenschichten befindet sich eine organische Auflage, der sogenannte Humus. Er besteht aus abgestorbenen und mehr oder weniger stark zersetzten Pflanzenbestandteilen wie Blätter und Nadeln. Die Mannheimer Waldböden haben eine leicht saure Humusauflage mit wenigen Nährstoffen. Unter der Humusauflage befindet sich der Mineralboden mit den angesprochenen unterschiedlichen Schichten. Diese sind auch verschieden gefärbt je nach Bodenentwicklung. Ganz unten befindet sich das Ausgangsgestein. In der Natur, also auch bei den hier zu sehenden Aufschlüssen, lassen sich die verschiedenen Schichten nicht mehr so genau voneinander abgrenzen. Je nach Bodenentwicklung weist man unterschiedliche Bodentypen aus. Was haben wir hier im Käfertaler Wald nun für einen Boden? <br /> Unterschiedliche Bodentypen haben unterschiedliche Eigenschaften, bestimmt vom Ausgangsgestein, dem Klima, der Bodenart wie Sand, Ton oder Lehm und der Vegetation. Im Käfertaler Wald herrscht der Bodentyp „Braunerde“ vor. Diese Böden sind aus Sanden und Kiesen entstanden. Die Sande sind entweder als Flugsand eingeweht oder vom Rhein angeschwemmt worden. Aufgrund des Ausgangsgesteins sind unsere Böden also sehr sandig. Entsprechend sind die hiesigen Braunerden trocken und nährstoffarm und haben eine geringe Kapazität, Wasser zu speichern. Nicht gerade der beste Untergrund für Waldbäume…Nur Bäume, die mit diesen Bedingungen zurechtkommen, haben in unserem Wald eine Zukunft.<br /> Zur nächsten Station folgen Sie bitte weiter dem Weg Nr. 1 am Karlstern Weiher entlang. Dort geht es um die nachhaltige Waldwirtschaft in Mannheim.',
audioSrc: 'Audio/Test.mp3'
},
{
imageSrc: 'images/KtW.jpg',
lngLat: [8.5168431, 49.5377149],
gallery: ['images/KtW.jpg', 'images/KtW_Station_2.jpg'],
galleryDescriptions: ['Beschreibung für Bild 1', 'Beschreibung für Bild 2'],
title: 'Station 10: Nachhaltige Waldwirtschaft',
description: 'Wir pflanzen also neue Bäume, um unseren Mannheimer Stadtwald zu erhalten. Warum wird auf der anderen Seite aber auch Holz geerntet?Wir alle nutzen Holz in unterschiedlichster Form. Der Bedarf und die Verwendung von Holz sind seit 1950 in Deutschland kontinuierlich angestiegen. Die jährliche Holzernte in deutschen Wäldern trägt gut ein Viertel zum hiesigen Gesamtaufkommen aller Holzprodukte bei. Viel Holz wird aber importiert, teils aus illegalen Holzeinschlägen. <br /> Im Mannheimer Stadtwald wird durch erforderliche Maßnahmen der Verkehrssicherung, Durchforstung und Kulturpflege Holz geerntet, das nachhaltig produziert wurde. Dabei werden mit Ausnahme der Pflegemaßnahmen nur absterbende Bäume entnommen. Auf diese Weise kann auch Mannheim zur lokalen Rohholzversorgung beitragen, damit wir nicht mehr so viel importieren müssen. Die nachhaltige Holznutzung im Mannheimer Stadtwald bedeutet, dass in der Summe deutlich weniger entnommen wird, als nachwächst. Das ist in der sogenannten Forsteinrichtung so festgelegt, die 2020 vom Gemeinderat verabschiedet wurde. Die Forsteinrichtung ist das bestimmende Bewirtschaftungs- und Planungsinstrument für den Forstbetrieb. Sie erfasst und kontrolliert Daten und passende Planungen zu Holzzuwachs, Totholzanteil und vieles mehr. Auf eine planmäßige Ernte starker und gesunder Bäume verzichten wir in Mannheim ganz bewusst. Aber obwohl wir auf einzelnen Flächen Platz für klimastabile Waldbäume schaffen, erhöht sich der Vorrat an Holz und Bäumen auf der Gesamtfläche des Stadtwaldes Jahr für Jahr – und zwar deutlich.  Nun geht es zurück zum Ausgangspunkt, dem Karlstern. Dazu folgen Sie bitte Weg Nr. 1, weg vom Weiher bis zur Langen Allee und dann rechts weiter bis zum Karlstern.',
audioSrc: 'Audio/Test.mp3'
},
{
imageSrc: 'images/KtW.jpg',
lngLat: [8.5140882, 49.5366096],
gallery: ['images/KtW.jpg', 'images/KtW_Station_2.jpg'],
galleryDescriptions: ['Beschreibung für Bild 1', 'Beschreibung für Bild 2'],
title: 'Station 11: Danke und auf Wiedersehen!',
description: 'Nun sind wir am Ende unserer Audioguide-Tour angekommen. Vielen Dank für Ihr Interesse und Ihre Teilnahme. Vielleicht dürfen wir Sie ja auch mal bei einem unserer Waldspaziergänge oder Bürgerprojekte begrüßen.<br /> Weitere Informationen zu vielen verschiedenen Themen rund um den Stadtwald finden Sie auch auf unserer Webseite: <a href="https://www.mannheim.de/de/service-bieten/gruene-stadt/wald" target="_blank">mannheim.de/wald</a>. <br /> <br /> Auf Wiedersehen!</p>',
audioSrc: 'Audio/Test.mp3'
},
];

// locationcontent is connected with popups
locations.forEach(location => {
createMarkerAndPopup(location.imageSrc, location.lngLat,location.gallery,location.galleryDescriptions, location.title, location.description, location.audioSrc);
});


// GeoJSON for route around Kaefertaler Wald
const geojson = {
"type": "Feature",
"properties": {
    "name": "Route um den Käfertaler Wald"
},
"geometry": {
    "type": "LineString",
    "coordinates": [
    [ 8.513820617002045, 49.536756216362996 ], [ 8.513846692808364, 49.536840141047072 ], [ 8.513859642617586, 49.53696648515659 ], [ 8.51375789411658, 49.537200420989421 ], [ 8.513645574342741, 49.537456822980303 ], [ 8.513512816774762, 49.537762216862703 ], [ 8.513421991922351, 49.537968708237877 ], [ 8.513293462863505, 49.538261750701707 ], [ 8.513199466629239, 49.538475100059657 ], [ 8.513062480552129, 49.538788319468665 ], [ 8.513016055045609, 49.538897336959543 ], [ 8.5129600272996, 49.539020417242966 ], [ 8.512912104196097, 49.539125032381811 ], [ 8.512838193380214, 49.539285727658843 ], [ 8.512767365852241, 49.539441391772321 ], [ 8.512651258038973, 49.539694123380841 ], [ 8.512569418768468, 49.539869622733598 ], [ 8.512645179557092, 49.539991614420494 ], [ 8.51273626869132, 49.540140645088641 ], [ 8.512835902937754, 49.540302480332009 ], [ 8.512952186938898, 49.540491811451808 ], [ 8.513085649258393, 49.54071018157876 ], [ 8.513236642271995, 49.54095587538739 ], [ 8.513398647028136, 49.54121906021868 ], [ 8.513579327699606, 49.541514369747034 ], [ 8.513776834313671, 49.541835801221808 ], [ 8.513423489519285, 49.541793271551754 ], [ 8.512978791308853, 49.541738794648801 ], [ 8.512639365357034, 49.541697122349404 ], [ 8.512194314770843, 49.541642873994199 ], [ 8.51182396784599, 49.541597543130649 ], [ 8.51174547614522, 49.541778752005392 ], [ 8.511616242334856, 49.542075658721679 ], [ 8.511510617700488, 49.542320373894547 ], [ 8.511372574496097, 49.542638313150526 ], [ 8.511259549970745, 49.542898802293585 ], [ 8.511083890653868, 49.54330282352322 ], [ 8.51093219288874, 49.543652823933655 ], [ 8.510839958533287, 49.543863920470308 ], [ 8.510523701287754, 49.544585403020413 ], [ 8.510775473769019, 49.544011395982395 ], [ 8.510893651789875, 49.543741323966941 ], [ 8.510959722245071, 49.543819291891879 ], [ 8.511116088989031, 49.544001235619845 ], [ 8.512034952832915, 49.543654267258596 ], [ 8.512677598127109, 49.543411273616329 ], [ 8.513383406776475, 49.543144099254221 ], [ 8.514056620667946, 49.542890413730255 ], [ 8.514336407022212, 49.542780890685968 ], [ 8.514396310901589, 49.542757568419361 ], [ 8.514607912546094, 49.542679998937864 ], [ 8.514930160179564, 49.542559843167766 ], [ 8.5154444526028, 49.542368919499992 ], [ 8.516690012824137, 49.541904697493841 ], [ 8.51701314139701, 49.541786254724279 ], [ 8.517416083079761, 49.541637057583735 ], [ 8.518785591475044, 49.54112864061161 ], [ 8.520231741598357, 49.540584661748738 ], [ 8.520274026689684, 49.540568655553457 ], [ 8.520006221111293, 49.539935606325592 ], [ 8.519714806356912, 49.53925304270534 ], [ 8.518934998797727, 49.539150485840054 ], [ 8.518998954998356, 49.538940340777046 ], [ 8.519012345277275, 49.538716932031328 ], [ 8.518976402949651, 49.538549317634434 ], [ 8.518895532712492, 49.538368096783607 ], [ 8.518720930522898, 49.538179900791256 ], [ 8.518495057660067, 49.537979813127237 ], [ 8.518277465627627, 49.537867535004928 ], [ 8.518106915759281, 49.537811281510592 ], [ 8.517949932357739, 49.537776408885065 ], [ 8.517673845948963, 49.537745309342263 ], [ 8.517257513987293, 49.537718211562755 ], [ 8.516842943904427, 49.537716839522894 ], [ 8.516571790756306, 49.53717293701726 ], [ 8.515620111919675, 49.536952435822108 ], [ 8.515002749586335, 49.536767778883402 ], [ 8.514959231179844, 49.536726445361609 ], [ 8.514650814294995, 49.536407267072164 ], [ 8.514352968682974, 49.536514174594544 ], [ 8.513907301439199, 49.536675450152408 ], [ 8.51381964796864, 49.53675325784377 ], [ 8.513820617002045, 49.536756216362996 ] 
    ]
}
};

function addRoute() {
map.addLayer({
'id': 'route',
'type': 'line',
'source': {
'type': 'geojson',
'data': geojson
},
'layout': {
'line-join': 'round',
'line-cap': 'round'
},
'paint': {
'line-color': 'SteelBlue',
'line-width': 4
}
});
}

map.on('load', function () {
addRoute();
});

map.on('styledata', function () {
if (!map.getLayer('route')) {
addRoute();
}
});

// lokation is added
map.addControl
(new maplibregl.GeolocateControl({
positionOptions: {
    enableHighAccuracy: true
},
trackUserLocation: true
}));

// zoom-out-in features are added
map.addControl(new maplibregl.NavigationControl());

// Function to calculate the distance between two geographical coordinates using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
const R = 6371e3; // radius of earth in meters
const φ1 = lat1 * Math.PI / 180; // Latitude in radiant
const φ2 = lat2 * Math.PI / 180;
const Δφ = (lat2 - lat1) * Math.PI / 180;
const Δλ = (lon2 - lon1) * Math.PI / 180;

const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
Math.cos(φ1) * Math.cos(φ2) *
Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

const distance = R * c; // distance in meters
return distance;
}

// Feature to check if user is near a station and open the popup window
function checkNearbyStations(userLocation) {
locations.forEach(location => {
const distance = calculateDistance(userLocation.lat, userLocation.lng, location.lngLat[1], location.lngLat[0]);
if (distance <= 20) { // When the user is less than 20 meters from the station
// open pupup window for that station
location.marker.getPopup().addTo(map);
} else {
// close popup window for that station, if it's open
map.closePopup();
}
});
}

// Track user position and check if stations are nearby when user moves
map.on('locationfound', function (e) {
checkNearbyStations(e.latlng);
});

// update checking of nearby stations as user moves
map.on('locationerror', function (e) {
console.log(e.message);
});

// start user localization
map.locate({ watch: true, enableHighAccuracy: true });