HEIGHT = 16;
WIDTH = 16;
MINES = 40;
TIMER = false;

function getUniqueRandomIndexesInField(table, indexes) {
    indexes = indexes ? indexes : [];
    for (var i = indexes.length; i < MINES; i++) {
        var random_cell = Math.floor(Math.random() * WIDTH);
        var random_row = Math.floor(Math.random() * HEIGHT);
        for (var j = 0; j < indexes.length; j++) {
            if (indexes[j][0] === random_cell &&
                indexes[j][1] === random_row) {
                return arguments.callee(indexes);
            }
        }
        indexes.push([random_cell, random_row]);
    }
    return indexes;
}

function getAdjacentCellIndexes(x, y) {
    return $.grep([
        [ x - 1, y - 1 ],
        [ x, y - 1 ],
        [ x + 1, y - 1 ],
        [ x - 1, y ],
        [ x + 1, y ],
        [ x - 1, y + 1 ],
        [ x, y + 1 ],
        [ x + 1, y + 1 ]
    ], function (element) {
        return element[0] >= 0 && element[1] >= 0
            && element[0] < WIDTH && element[1] < HEIGHT
    });
}

function criarJogo(){

var field_matrix = [];
var field = $("#field table");
for (var i = 0; i < HEIGHT; i++) {
    var row_vector = [];
    var row = $("<tr>");
    for (var j = 0; j < WIDTH; j++) {
        var cell = $("<td>");
        cell.data("mines", 0);

        var button = $("<div>");
        button.addClass("button");
        button.data("coordinates", [j, i]);

        button.contextmenu(function () {
            return false;
        });
        counter = 0;
        button.mousedown(function(event) {
            if (!TIMER) {
                TIMER = setInterval(function () {
                    counter++;
                    $("#timer").text(counter);
                }, 1000);
            }
            if (event.which === 3) {
                $(this).toggleClass("red-flag");
                $("#mines").text($(".red-flag").length);
            } else {
                $("#reset").addClass("wow");
            }
        });

        button.mouseup(function () {
            $("#reset").removeClass("wow");
            if (!$(this).hasClass("red-flag")) {
                if ($(this).parent().hasClass("mine")) {
                    $("td .button").each(function (index, button) {
                        button.remove();
                    })
                    $("#reset").addClass("game-over");
                    clearInterval(TIMER);
                } else if ($(this).parent().data("mines") > 0) {
                    $(this).remove();
                } else if ($(this).parent().data("mines") === 0) {
                    var coordinates = $(this).data("coordinates");
                    $(this).remove();
                    (function (x, y) {
                        var adjacent_cells = getAdjacentCellIndexes(x, y);
                        for (var k = 0; k < adjacent_cells.length; k++) {
                            var x = adjacent_cells[k][0];
                            var y = adjacent_cells[k][1];
                            var cell = $(field_matrix[y][x]);
                            var button = cell.children($(".button"));
                            if (button.length > 0) {
                                button.remove();
                                if (cell.data("mines") === 0) {
                                    arguments.callee(x, y);
                                }
                            }
                        }
                    })(coordinates[0], coordinates[1]);
                }

                if ($("td .button").length === MINES) {
                    var winner_name = prompt("Parabéns! Qual é o seu nome?");
                    $("#reset").addClass("winner");
                    clearInterval(TIMER);

                    $.ajax({
                        method: "POST",
                        url: "https://campo-minado.herokuapp.com/save",
                        contentType: "application/json",
                        dataType: "json",
                        data: JSON.stringify ({
                            timestamp: Date.now(),
                            name: winner_name,
                            score: counter
                            })
                        })
                        .done(function(data) {
                            console.log("data", data);
                        })
                        .catch(function(error) {
                            console.log("error", error);
                        })
                }
            }
        })

        cell.append(button);

        row.append(cell);
        row_vector.push(cell)
    }
    field.append(row);
    field_matrix.push(row_vector);
}

var mine_indexes = getUniqueRandomIndexesInField(field_matrix);
$.each(mine_indexes, function(index, coordinates) {
    var x = coordinates[0];
    var y = coordinates[1];
    var mine = $(field_matrix[y][x]);
    mine.addClass("mine");
});

$.each(mine_indexes, function (index, coordinates) {
    var adjacent_cells = getAdjacentCellIndexes(coordinates[0], coordinates[1]);
    $.each(adjacent_cells, function(index, coordinates) {
        var x = coordinates[0];
        var y = coordinates[1];
        var cell = $(field_matrix[y][x]);
        if (!cell.hasClass("mine")) {
            var num_mines = cell.data("mines") + 1;
            cell.data("mines", num_mines);
            switch (num_mines) {
                case 1:
                    cell.css("color", "blue");
                    break;
                case 2:
                    cell.css("color", "green");
                    break;
                case 3:
                    cell.css("color", "red");
                    break;
                case 4:
                    cell.css("color", "navy");
                    break;
                case 5:
                    cell.css("color", "maroon");
                    break;
                case 6:
                    cell.css("color", "teal");
                    break;
                case 7:
                    cell.css("color", "DarkMagenta");
                    break;
                case 8:
                    cell.css("color", "black");
                    break;
            }
        }
    })
    
});

$.each(field_matrix, function(index, row) {
    $.each(row, function(index, cell) {
        var number = $(cell).data("mines");
        if (number > 0) {
            $(cell).append(number);
        }
    });
});
}   

function funcaoZerar() {
    $("#field table").html("");
    reset.removeClass("game-over wow winner");
    clearInterval(TIMER);
    $("#timer").html("");
    $("#mines").html("");
    TIMER = false;
    criarJogo();
    }

criarJogo();

$(".myDropdown").mouseover(function(e) {
    $('#dropdownContent').show();
});

$(".window-controls").mouseleave(function(e) {
    $('#dropdownContent').hide();
});

var botaoIniciante = $("#iniciante");
var botaoIntermediario = $("#intermediario");
var botaoAvancado = $("#avancado");

botaoIniciante.mousedown(function(){
    $("#field table").html("");
    HEIGHT = 8;
    WIDTH = 8;
    MINES = 10;
    criarJogo();
    $('.window').css("width", "267px");
    $('.ranking').css("max-height", "390px");
    funcaoZerar();
})

botaoIntermediario.mousedown(function(){
    $("#field table").html("");
    HEIGHT = 16;
    WIDTH = 16;
    MINES = 40;
    criarJogo();
    $('.window').css("width", "480px");
    $('.ranking').css("max-height", "630px");
    funcaoZerar();
})

botaoAvancado.mousedown(function(){
    $("#field table").html("");
    HEIGHT = 24;
    WIDTH = 24;
    MINES = 90;
    criarJogo();
    $('.window').css("width", "746px");
    $('.ranking').css("max-height", "870px");
    funcaoZerar();
})

var reset = $("#reset");
reset.mousedown(function(){
    funcaoZerar();
})

$.ajax("https://campo-minado.herokuapp.com/get")
	.done(function(data) {	
        var ranking = $(".ranking table");
		for (var i = 0; i < data.length; i++) {
            console.log(data[i].score)
            console.log(data[i].name)

            var linha = $("<tr>");
            var nome = $("<td>");
            var pontos = $("<td>");

            nome.append(data[i].name);
            pontos.append(data[i].score);

            linha.append(nome);
            linha.append(pontos);

            ranking.append(linha)
            }
    })

