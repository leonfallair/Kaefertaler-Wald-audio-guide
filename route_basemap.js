// route_basemap.js

export const geojson = {
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
    
    export function addRoute(map) {
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