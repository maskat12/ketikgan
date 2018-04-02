
$(document).ready(function(){

var news_data = {
    news_id : 0,
    array_of_text: [],
    origin: "",
    out_tags: []
}
var selected_index = {};
var db_tags = [];
var is_edit = 0; //0 false (news feeding), 1 true(database local)
//first fetch
loadNewsFeeding();

//header clicks
$("#nav-news-feeding-tab").on('click',function(){
    is_edit = 0;
    news_data = {
        news_id : 0,
        array_of_text: [],
        origin: "",
        out_tags: []
    }
    removeDisplay();
    loadNewsFeeding();
})

$("#nav-edit-news-tab").on('click',function(){
    is_edit = 1;
    news_data = {
        news_id : 0,
        array_of_text: [],
        origin: "",
        out_tags: []
    }
    removeDisplay();
    loadNews();
    
})


//news paginate
$("#pagination").on('submit',function(e){
    e.preventDefault();
    pageDisplay();
})
$("#db-ketikgan").on('click','#transpose-data',function(){
    $("#selected-text").html(" ")
    $(".alert-msg").html("").removeClass("alert alert-success");
    news_data.out_tags = [];
    var data = $(this).data();
    news_data.news_id = data.id;
    if(is_edit === 0){
        $(".gabung").empty();
        var out = transpose(data.origin);
        news_data.array_of_text = out;
        out.forEach(function(w) {
            $(".gabung").append('<span>' + w + "</span> ");
            });
    }
    if(is_edit === 1){
        loadOneNews(data.id);
    }
    displayTags();
    
})

//ketika user menselect kata-kata atau kalimat yang ada di paragraf
$(".gabung").on('mouseup', function() {
    $('#tags-multiple').val("").trigger('change');
  $("#selected-text").html("")
	var selection = document.getSelection().getRangeAt(0);
 	var start = $(".gabung span").index(selection.startContainer.parentNode);
    var end = $(".gabung span").index(selection.endContainer.parentNode);
    //console.log(start, end, selection.startContainer, selection.endContainer)
    selected_index = {
        start: start,
        end: end
    }
    for(var i = 0; i < $(".gabung span").length; i++) {
        if(i >= start && i <= end) {
            $(".gabung span").eq(i).addClass("selected");
        $("#selected-text").append($(".gabung span").eq(i).text() + " ")
        } else {
            $(".gabung span").eq(i).removeClass("selected");
        }
    }

    //console.log(out_tags)
    news_data.out_tags.map((d)=>{
        if(d.start === start && d.end === end){
                $('#tags-multiple').val(d.tags).trigger('change');

        }
    })
  
})

//delete tags dengan menekan tombol x
$("#tagged-text").on('click',"#delete-tag",function(){
    var index = $("#delete-tag").data();
    news_data.out_tags.splice(index,1);
    displayTags();
})


// multi tags init
$("#tags-multiple").select2({
    ajax: {
        url: '/api/tags',
        dataType: 'json',
        processResults: function(data){
            db_tags = data;
            var results = []
            data.map((d)=>{
                results.push({
                    id: d.id,
                    text: d.name
                })
            })
            return {
                results
            }
        }
    }
})
//user input tags lalu klik button
$("#btn-add-tags").on('click',function (){
    var tags = $("#tags-multiple").select2('data');
    var tagged = [];
    if((selected_index.start != -1 || selected_index.end != -1) && selected_index && tags.length > 0 && $('#selected-text').html()){
        var t_temp = {
            start: selected_index.start,
            end: selected_index.end,
            tags: []
        }
        tags.map((t)=>{
            t_temp.tags.push(t.id);
        })

        //check tags apakah sudah ada atau belum
        if(news_data.out_tags.length > 0){
            news_data.out_tags.map(function (ot,i){
                if(ot.start == selected_index.start && ot.end == selected_index.end){
                    tagged.push(i);
                }
            })
        }
        
        if(tagged.length > 0){
            tagged.map(function(d){
                news_data.out_tags.splice(d,1);
            })
        }
        //push ke out_tags lalu tampilkan di tagged-text
        news_data.out_tags.push(t_temp);
        displayTags();
    }
    $('#tags-multiple').val([]).trigger('change');
});

//generate output ke php
$("#save-output").on('click',function () {
    $("#generate-output").prop('disabled',false);
    var data = $(this).data()
    saveOutput();
    
})

$("#generate-output").on('click',function () {
    id = $(this).data('id');
    generateOutput(id);
})

//fetch all news data dari database local
function loadNews(page=1) {
    $.ajax({
        type: 'GET',
        url: '/api/news/',
        data:{
            page:page
        },
        contentType: "application/json",
        success: function(data) {
            $("#db-ketikgan").html(
                "<thead><tr><th>News ID</th><th>Teks</th><th>Action</th></tr></thead><tbody>"+
                data.map(function(d,i){
                    var origin = d.origin;
                    news_data.out_tags = JSON.parse(d.tags);
                    if(origin.length > 350){
                        origin = origin.substring(0,350) + '...';
                    }
                    return '<tr><td>'+(d.newsId)+'</td><td class="original-text">'+ origin +'</td><td><button id="transpose-data" data-id="'+d.newsId+'" class="btn btn-secondary">Transpose News</button></td></tr>';
                })
                +"</tbody>"
            )

         }
    })
}


function displayTags(){

    //display tags di change
    $("#tagged-text").empty().html(
        news_data.out_tags.map((ot,i)=>{
            var kalimat = ""
            var display_tags = "";
            ot.tags.map((d)=>{
                db_tags.map((e,i)=>{
                    if(d == e.id){
                        display_tags += e.name + " ";
                    }
                });
            })
            for(var i = ot.start; i <= ot.end; i++){
                kalimat += news_data.array_of_text[i] + " ";
            }
            return '<span><button id="delete-tag" data-index='+i+' type="button" class="btn btn-danger">&times;</button> ' + display_tags + '= ' + kalimat +'</span><p>'
        })
    )
    $(".gabung span").removeClass("text-tagged").removeAttr();

    //asign tags di teks berita
    for(var i = 0; i < $(".gabung span").length; i++) {
        var title = [];
        news_data.out_tags.map((d)=>{
            if(i >= d.start && i <= d.end) {
                d.tags.map((e,i)=>{
                    db_tags.map((f)=>{
                        if(e == f.id){
                            title.push(f.name);
                        }
                    });
                })
                $(".gabung span").eq(i).addClass("text-tagged").attr({
                    title: title.join(", "),
                    "data-original-title": title.join(", ")
                }).tooltip();
            }
        }) 
    }
}

//fetch data dari database news  feeding
function loadNewsFeeding(page=1) {
    $.ajax({
        type: 'GET',
        url: `/api/newsfeeding/`,
        contentType : 'application/json',
        data:{
            page:page
        },
        success: function(data){
            $("#db-ketikgan").html(
                "<thead><tr><th>No</th><th>Teks</th><th>Action</th></tr></thead><tbody>"+
                data.data.map(function(d,i){
                    var origin = d.content;
                    if(origin.length > 350){
                        origin = origin.substring(0,350) + '...';
                    }
                    return '<tr><td>'+(i+1)+'</td><td class="original-text">'+ origin +'</td><td><button id="transpose-data" data-id="'+d.id+'" data-origin="'+d.content+'" class="btn btn-secondary">Transpose News</button></td></tr>';
                })
                +"</tbody>"
            )
        }
    })
}

//fetch satu data news untuk edit
function loadOneNews(id){
    $.ajax({
        type: 'GET',
        url: '/edit',
        data: {id:id},
        contentType: "application/json",
        success: function(data) {
            $(".gabung").empty();
            var out = transpose(data.origin);
            news_data.array_of_text = out;
            console.log(news_data);
            out.forEach(function(w) {
                $(".gabung").append('<span>' + w + "</span> ");
              });
            
            displayTags();
         }
    })
}

//transpose berita dari news feeding
function transpose(content) {
    news_data.origin = content;
    var output = [];
    var pointer;
    var begin;
    // Spit per kalimat.
    content.split(". ").forEach(function(word) {
      // Split per kata
      word.split(" ").forEach(function(w) {
        pointer = 0;
        begin = false;
        // Loop Per Huruf
        for (var i = 0; i < w.length; i++) {
          // Kalau Ketemu Huruf / Angka / &
          if (/[\w\d&]+/i.test(w.charAt(i))) {
              // Jika belom mulai masukin huruf
            if (begin == false) {
                // Masukin ke array
              pointer = output.push(w.charAt(i)) - 1; // Keluarin index terakhir
              begin = true; // Set jadi mulai masukin huruf
            } else {
                // Jika sudah masukin huruf
              output[pointer] += w.charAt(i) // Lanjutin masukin huruf
            }
          // Cek karakter  atau ," di tengah2 kalimat
          }else if(/[,]/i.test(w.charAt(i)) && (/[^\d]/i.test(w.charAt(i+1)) && /[^\d]/i.test(w.charAt(i-1))) ){
            output.push(w.charAt(i));
            begin = false;
            // Cek karakter pendukung di tengah2 kalimat
          } else if (/[,.]+/i.test(w.charAt(i)) && i < w.length - 1) {
            output[pointer] += w.charAt(i) // Lanjut masukin karakter
          // Kalau ada karakter yang tidak valid bikin baru.
          } else {
            output.push(w.charAt(i))
            begin = false;
          }
        }
      })
      output.push(".");
    })
    $("#generate-output").prop('disabled',true);
    return output;

}

//save berita dari news feeding
function saveOutput(){
    $.ajax({
        type: 'POST',
        url: '/save',
        data: JSON.stringify(news_data),
        contentType: "application/json",
        success: function(data) {
            $("#generate-output").data('id',data.newsId);
            $(".alert-msg").html("Save Data Success!").addClass("alert alert-success");
         }
    }).fail(function (){
        $(".alert-msg").html("Save Data Failed");
    });
}

//edit berita yang udah ada
function editOutput(){
    $.ajax({
        type: 'POST',
        url: '/edit',
        data: JSON.stringify({
            data: JSON.stringify(news_data)
        }),
        contentType: "application/json",
        success: function(data) {
            $("#generate-output").data('id',data.id);
         }
    });
}

//generate output txt file
function generateOutput(id){
    $.ajax({
        type: 'POST',
        url: 'generate',
        data: JSON.stringify({
            id: id,
            data: JSON.stringify(news_data),
            db_tags: JSON.stringify(db_tags)
        }),
        contentType: "application/json",
    });
}

function removeDisplay(){
    $(".gabung").empty();
    $(".alert-msg").empty();
    $(".title-tab").html("Edit News Tags")
    $(".alert-msg").html("").removeClass("alert alert-success");
    displayTags();
}

function pageDisplay(){
    var page = $("#page-input").val();
    if(is_edit === 0){
        loadNewsFeeding(page)
    }else{
        loadNews(page)
    }
    console.log(page);
}

});