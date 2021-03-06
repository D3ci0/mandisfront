
var text_home = "Il sistema Mandis nasce con l'intenzione di monitorare le principali sorgenti di inquinamento Italiane con lo scopo di trovare correlazioni tra esse ed alcune patologie diagnosticate su tutto il territorio. \
Molte patologie croniche sono state correlate, ad esempio, alla qualità dell'aria. La ricerca in questa direzione potrebbe offrire numerosi vantaggi volti a migliorare la qualità della nostra vita e a garantire un maggiore sviluppo economico e sociale per il paese.\
Il sistema, sviluppato per l'ente territoriale 'enteUnina', mette a disposizione degli utilizzatori una mappa sulla quale sono rappresentate le posizioni delle sorgenti di inquinamento identificate (attive e non più attive), oltre alla posizione di diverse patologie diagnosticate (rappresentate dall'indirizzo del soggetto malato).\
Il sistema è stato sviluppato da Danilo Ciano e Yuri Attanasio, studenti del Corso Magistale di Informatica dell'università Federico II di Napoli.";

var text_ricerca = "Tramite strumenti di ricerca geografica, il sistema permette di effettuare diverse tipologie di ricerca al fine di analizzare possibili correlazioni tra sorgente e patologia.";

var text_inserimento = "Il sistema permette l'aggiunta di nuove sorgenti e nuove diagnosi al fine di popolare e mantenere sempre aggiornato il database.";

var feature = null;

/*   Displays overlay with "Please wait" text. Based on bootstrap modal. Contains animated progress bar.  */
function showPleaseWait() {
    var modalLoading = '<div class="modal" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false role="dialog">\
                    <div class="modal-body" style="margin-top: 22%; margin-left:45%;">\
                        <div class="loader">\
                        </div>\
                    </div>\
                </div>';
    $(document.body).append(modalLoading);
    $("#pleaseWaitDialog").modal("show");
}

/* Hides "Please wait" overlay. See function showPleaseWait(). */
function hidePleaseWait() {
    $("#pleaseWaitDialog").modal("hide");
}

function hide_error(){
    if($('#error_alert').css('display') != 'none') {
        $('#error_alert').animate({
            height: "toggle",
            opacity: "toggle"
        }, 1000);
    }
}

function tip(){
    $('#tip').animate({
        height: "toggle",
        opacity: "toggle"
    }, 1000);
}

function show_success(){
    $('#success_alert').animate({
        height: "toggle",
        opacity: "toggle"
    }, 1000);
}


function reset_map_drawing(){
    //Reset dell'area disegnata tramite drawing manager di Google Maps
    for (var i = 0; i < shapes.length; i++) {
        shapes[i].setMap(null);
    }
    shapes = [];
}

function remove_geoJson(){
    sessionStorage.removeItem('geoJson');
}

function reset_search(){
    reset_map_drawing();
    remove_geoJson();
    hide_error();
}

function validate_shape(){
    shape = sessionStorage.getItem('geoJson');
    return shape;
}

function show_error(error){
    $('#error_alert').show();
    $('#error_text').html("<strong>Attenzione</strong>"+" " + error +"");
}

function validate_date(){
    var data_inizio = $("#data_inizio_input").val();
    var data_inizio_array = data_inizio.split("/");
    var data_inizio_date = new Date(data_inizio_array[2], data_inizio_array[1]-1, data_inizio_array[0]);
    var data_fine = $('#data_fine_input').val();
    var data_fine_array = data_fine.split("/");
    var data_fine_date = new Date(data_fine_array[2], data_fine_array[1]-1, data_fine_array[0]);

    if(data_fine == "" && data_inizio != ""){
        return true;
    }

    if(data_fine_date > data_inizio_date)
        return true;

    return false;
}

function exportGeoJson(shape) {
    var geoJson = {
        "type": "FeatureCollection",
        "features": []
    };
    var shapeFeature = {
        "type": "Feature",
        "geometry": {
            "type": "",
            "coordinates": []
        },
        "properties": {}
    };
    var arr = [];
    switch (shape.type) {
        case google.maps.drawing.OverlayType.MARKER:{
            shapeFeature.geometry.coordinates.push(shape.position.lng(), shape.position.lat());
            shapeFeature.geometry.type = "point";
            geoJson.features.push(shapeFeature);
            break;
        }
        case google.maps.drawing.OverlayType.POLYLINE:{
            for (var i = 0; i < shape.getPath().getLength(); i++) {
                var pt = shape.getPath().getAt(i);
                shapeFeature.geometry.coordinates.push([pt.lng(), pt.lat()]);
            }
            shapeFeature.geometry.type = "linestring";
            geoJson.features.push(shapeFeature);
            break;
        }
        case google.maps.drawing.OverlayType.POLYGON: {
            for (var i = 0; i < shape.getPath().getLength(); i++) {
                var pt = shape.getPath().getAt(i);
                arr.push([pt.lng(), pt.lat()]);
            }
            var pt = shape.getPath().getAt(0);
            arr.push([pt.lng(), pt.lat()]);
            shapeFeature.geometry.coordinates.push(arr);
            shapeFeature.geometry.type = google.maps.drawing.OverlayType.POLYGON;
            geoJson.features.push(shapeFeature);
            break;
        }
        case google.maps.drawing.OverlayType.RECTANGLE: {
            var b = shape.getBounds(),
                p = [   [
                    b.getSouthWest().lng(),
                    b.getSouthWest().lat()
                ],
                    [
                        b.getNorthEast().lng(),
                        b.getSouthWest().lat()
                    ],
                    [
                        b.getNorthEast().lng(),
                        b.getNorthEast().lat()
                    ],
                    [
                        b.getSouthWest().lng(),
                        b.getNorthEast().lat()
                    ],
                    [
                        b.getSouthWest().lng(),
                        b.getSouthWest().lat()
                    ]

                ]
            shapeFeature.geometry.coordinates.push(p);
            shapeFeature.geometry.type = google.maps.drawing.OverlayType.POLYGON;
            geoJson.features.push(shapeFeature);
            break;
        }
        case google.maps.drawing.OverlayType.CIRCLE:{
            var center = [
                shape.getCenter().lng(),
                shape.getCenter().lat()
            ]
            shapeFeature.geometry.type = google.maps.drawing.OverlayType.CIRCLE;
            shapeFeature.geometry.coordinates.push(center);
            shapeFeature.properties = shape.getRadius();
            geoJson.features.push(shapeFeature);
            break;
        }
    }
    return geoJson;
}

function circolari_func(checkbox_c) {
    if (checkbox_c.checked) {
        for (var i = 0; i < features.length; i++) {
            if (features[i].getGeometry().getType() == 'Polygon' && features[i].getProperty('raggio') != null)
                map.data.add(features[i]);
        }
    } else {
        for (var i = 0; i < features.length; i++) {
            if (features[i].getGeometry().getType() == 'Polygon' && features[i].getProperty('raggio') != null)
                map.data.remove(features[i]);
        }
    }
}

function poligonali_func(checkbox_p) {
    if (checkbox_p.checked) {
        for (var i = 0; i < features.length; i++) {
            if (features[i].getGeometry().getType() == 'Polygon' && features[i].getProperty('raggio') == null)
                map.data.add(features[i]);
        }
    } else {
        for (var i = 0; i < features.length; i++) {
            if (features[i].getGeometry().getType() == 'Polygon' && features[i].getProperty('raggio') == null)
                map.data.remove(features[i]);
        }
    }
}

function lineari_func(checkbox_l) {
    if (checkbox_l.checked) {
        for (var i = 0; i < features.length; i++) {
            if (features[i].getGeometry().getType() == 'LineString')
                map.data.add(features[i]);
        }
    } else {
        for (var i = 0; i < features.length; i++) {
            if (features[i].getGeometry().getType() == 'LineString')
                map.data.remove(features[i]);
        }
    }
}

function show_infowindow(event, infowindow, source_content, diagnosis_content){
    contentString = null;
    feature = event.feature;
    switch(event.feature.getGeometry().getType()){
        case "Polygon":{
            contentString = source_content;
            infowindow.setPosition(event.feature.getGeometry().getAt(0).getAt(0));
            infowindow.setContent(contentString);
            infowindow.open(map);
            break;
        }
        case "LineString":{
            contentString = source_content;
            infowindow.setPosition(event.feature.getGeometry().getAt(0));
            infowindow.setContent(contentString);
            infowindow.open(map);
            break;
        }
        case "Point":{
            contentString = diagnosis_content;
            infowindow.setPosition({lat: event.feature.getGeometry().get().lat(), lng: event.feature.getGeometry().get().lng()});
            infowindow.setContent(contentString);
            infowindow.open(map);
            break;
        }
    }
    inizializza_validator();
}

function inizializza_validator(){
    $.validate({lang: 'it'});
}

function get_diagnosi_button_string(event){
    var data_diagnosi = new Date(event.feature.getProperty('data_diagnosi'));

    string =    '<form id="ricerca_sorgenti_infowindow">' +
                    '<div id="content">'+
                        '<h3 style="font-size: small" id="firstHeading" class="firstHeading">Informazioni sulla diagnosi</h3>'+
                        '<table class="table table-sm" style="border-bottom:none">'+
                            '<tbody >'+
                                '<tr>'+
                                    '<th> Data Diagnosi </th>'+
                                    '<td>'+ ddMMyyyyDate(data_diagnosi) +'</td>'+
                                '</tr>'+
                                '<tr>'+
                                    '<th> Patologia </th>'+
                                    '<td>'+ event.feature.getProperty('patologia') +'</td>'+
                                '</tr>'+
                                '<tr>'+
                                    '<th> Tipologia </th>'+
                                    '<td>'+ tipologia(event) +'</td>'+
                                '</tr>'+
                            '</tbody>'+
                        '</table>'+
                        '<input type = "text" class="form-control" id="select_distanza_infowindow" value="" data-validation="number" data-validation-allowing="positive" placeholder="Inserisci la distanza">'+
                        '<button style="width: 100%; margin-top:10px" id="search_btn" class="btn btn-primary"  onclick="infowindow_sorgenti_search(); return false;">'+
                        'Cerca'+
                        '</button>'+
                    '</div>'+
                '</form>';

    return string;
}

function get_source_button_string(event){
    var data_inizio = new Date(event.feature.getProperty('data_inizio'));
    var data_fine = null;
    if(event.feature.getProperty('data_fine')!= null) {
        data_fine = new Date(event.feature.getProperty('data_fine'));
    }
        string =    '<form id="ricerca_sorgenti_infowindow">' +
                        '<div id="content">'+
                            '<h3 style="font-size: small" id="firstHeading" class="firstHeading">Informazioni sulla sorgente</h3>'+
                                '<table class="table table-sm" style="border-bottom:none">'+
                                    '<tbody >'+
                                        '<tr>'+
                                            '<th> Data Inizio </th>'+
                                            '<td>'+ ddMMyyyyDate(data_inizio) +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th> Data Fine </th>'+
                                            '<td>'+ ddMMyyyyDate(data_fine) +'</td>'+
                                        '</tr>'+
                                        '<tr>'+
                                            '<th> Tipologia </th>'+
                                            '<td>'+ tipologia(event) +'</td>'+
                                        '</tr>'+
                                    '</tbody>'+
                                '</table>'+
                            '<input type = "text" class="form-control" id="select_distanza_infowindow" value="" data-validation="number" data-validation-allowing="positive" placeholder="Inserisci la distanza">'+
                            '<button style="width: 100%; margin-top:10px" id="search_btn" class="btn btn-primary"  onclick="infowindow_search(); return false;">'+
                            'Cerca'+
                            '</button>'+
                        '</div>'+
                    '</form>';

    return string;
}

function export_json(){
    var shapeFeature = {
        "type": "Feature",
        "geometry": {
            "type": "",
            "coordinates": []
        },
        "properties": {}
    };

    var point = {
        "point": []
    };

    var arr = [];



    if(feature.getGeometry().getType() == "Polygon"){
        for(var i=0;i<feature.getGeometry().getAt(0).getLength();i++){
            var pt = feature.getGeometry().getAt(0).getAt(i);
            arr.push([pt.lng(), pt.lat()]);
        }
        var pt = feature.getGeometry().getAt(0).getAt(0);
        arr.push([pt.lng(), pt.lat()]);
        shapeFeature.geometry.coordinates.push(arr);
        shapeFeature.geometry.type = "Polygon";
    }else if(feature.getGeometry().getType() == "LineString"){
        for(var i=0;i<feature.getGeometry().getLength();i++){
            var pt = feature.getGeometry().getAt(i);
            shapeFeature.geometry.coordinates.push([pt.lng(), pt.lat()]);
        }
        shapeFeature.geometry.type = "linestring";
    }else if(feature.getGeometry().getType() == "Point"){
        var pt = feature.getGeometry().get();
        point.point.push(pt.lng(), pt.lat());
        return point.point;
    }

    return shapeFeature;
}

function infowindow_sorgenti_search() {
    var distanza = Number(document.getElementById('select_distanza_infowindow').value);
    var feature_json = export_json();
    if (isNaN(distanza) == false && distanza > 0) {
        showPleaseWait();
        var json = {
            'distanza': distanza,
            'point': feature_json
        };

        console.log(json);

        $.ajax({
            type: "POST",
            dataType: "json",
            data: JSON.stringify(json),
            url: "https://floating-lowlands-19121.herokuapp.com/ricerca_sorgenti_per_diagnosi/",
            success: function (data) {
                console.log(JSON.parse(data));
                sessionStorage.setItem('geojson_srcfound', data);
                sessionStorage.setItem('residenza_paziente', json.point);
                sessionStorage.setItem('diagnosi_data',ddMMyyyyDate(feature.getProperty('data_diagnosi')));
                sessionStorage.setItem('diagnosi_patologia', feature.getProperty('patologia'));
                window.location.href = '/mandisfront/src/sorgenti_trovate.html';
                hidePleaseWait();
                var parsed_data = JSON.parse(data);
            },
            error: function (err) {
                alert(err);
                hidePleaseWait();
            }
        });
    }
}
function infowindow_search(){
    var distanza = Number(document.getElementById('select_distanza_infowindow').value);
    var feature_json = export_json();
    if(isNaN(distanza) == false && distanza>0) {
        showPleaseWait();
        var json = {
            'distanza': distanza,
            'features': feature_json
        };

        $.ajax({
            type : "POST",
            dataType : "json",
            data : JSON.stringify(json),
            url : "https://floating-lowlands-19121.herokuapp.com/ricerca_diagnosi_per_sorgente/",
            success : function(data) {
                hidePleaseWait();
                var parsed_data = JSON.parse(data);
                add_data_to_table(parsed_data);
            },
            error : function(err){
                alert(err);
                hidePleaseWait();
            }
        });

    }
}

function add_data_to_table(parsed_data){
    var data_table= $('#diagnosi_tab').DataTable();
    data_table.clear();
    data_table.draw();
    $fine_risultati = $("#diagnosi_tab>tbody>tr:first-child");
    $("#diagnosi_tab>tbody>tr:first-child").remove();

    for(var i=0 ; i<parsed_data.length ; i++) {
        $("#diagnosi_tab").find('tbody')
            .append($('<tr>')
                .append($('<td>')
                    .text(parsed_data[i][0])
                )
                .append($('<td>')
                    .text(parsed_data[i][1])
                )
            );

    }
    $("#diagnosi_tab").find('tbody').append($fine_risultati);
}

function get_source_string(event){
    var data_inizio = new Date(event.feature.getProperty('data_inizio'));
    var data_fine = null;
    if(event.feature.getProperty('data_fine')!= null) {
        data_fine = new Date(event.feature.getProperty('data_fine'));
    }
    string = '<div id="content">'+
        '<h3 style="font-size: small" id="firstHeading" class="firstHeading">Informazioni sulla sorgente</h3>'+
        '<table class="table table-sm" style="border-bottom:none">'+
            '<tbody >'+
                '<tr>'+
                    '<th> Data Inizio </th>'+
                    '<td>'+ ddMMyyyyDate(data_inizio) +'</td>'+
                '</tr>'+
                '<tr>'+
                    '<th> Data Fine </th>'+
                    '<td>'+ ddMMyyyyDate(data_fine) +'</td>'+
                '</tr>'+
                '<tr>'+
                    '<th> Tipologia </th>'+
                    '<td>'+ tipologia(event) +'</td>'+
                '</tr>'+
            '</tbody>'+
        '</table>'+
        '</div>';

    return string;
}

function get_diagnosi_string(event){
    var data_diagnosi = new Date(event.feature.getProperty('data_diagnosi'));

    string = '<div id="content">'+
        '<h3 style="font-size: small" id="firstHeading" class="firstHeading">Informazioni sulla diagnosi</h3>'+
            '<table class="table table-sm" style="border-bottom:none">'+
                '<tbody >'+
                    '<tr>'+
                    '   <th> Data Diagnosi </th>'+
                    '   <td>'+ ddMMyyyyDate(data_diagnosi) +'</td>'+
                    '</tr>'+
                    '<tr>'+
                        '<th> Patologia </th>'+
                        '<td>'+ event.feature.getProperty('patologia') +'</td>'+
                    '</tr>'+
                    '<tr>'+
                        '<th> Tipologia </th>'+
                        '<td>'+ tipologia(event) +'</td>'+
                    '</tr>'+
                '</tbody>'+
            '</table>'+
        '</div>';

    return string;
}

function tipologia(event){
    var tipologia = null;
    switch (event.feature.getGeometry().getType()){
        case "Polygon":{
            if(event.feature.getProperty('raggio') != null)
                tipologia = "Circolare";
            else
                tipologia = "Poligonale";
            break;
        }
        case "LineString":{
            tipologia = "Lineare";
            break;
        }
        case "Point":{
            tipologia = "Diagnosi";
            break;
        }
    }
    return tipologia;
}

function are_you_sure(){
    $("#areYouSureDialog").modal("show");
}

function ddMMyyyyDate(inputFormat) {
    if(inputFormat == null)
        return null;
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat);
    return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
}


/** Loader with progress bar */
/*
function showPleaseWait() {
    var modalLoading = '<div class="modal" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false role="dialog">\
            <div class="modal-dialog">\
                <div class="modal-content">\
                    <div class="modal-header">\
                        <h4 class="modal-title">Caricamento</h4>\
                    </div>\
                    <div class="modal-body">\
                        <div class="progress">\
                          <div class="progress-bar progress-bar-success progress-bar-striped active" role="progressbar"\
                          aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%; height: 40px">\
                          </div>\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>';
    $(document.body).append(modalLoading);
    $("#pleaseWaitDialog").modal("show");
}
 */
