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

function are_you_sure(){
    $("#areYouSureDialog").modal("show");
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
