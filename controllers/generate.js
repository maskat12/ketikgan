var fs = require('fs');

module.exports = function (req, res){
    var data = JSON.parse(req.body.data)
    var id = JSON.parse(req.body.id);
    var db_tags = JSON.parse(req.body.db_tags);
    var flag = true;
    console.log(db_tags);
    var line_text = "";
    data.array_of_text.map(function(d,i,flag=true){
        //add teks ke line_text
        line_text += d;
        //check jika ada tags ada di line atau tidak
        data.out_tags.map(function(e,j){
            if(i >= e.start && i <= e.end ){
                e.tags.map((tag_id) => {
                    db_tags.map((db_tag)=>{
                        if(tag_id == db_tag.id){
                            if(e.start == i){
                                line_text += " B-"+ db_tag.prefix;
                                flag = false;
                            }else if(i > e.start && i <= e.end){
                                line_text += " I-"+ db_tag.prefix;
                                flag = false;
                            }
                        }
                    })
                })
            }
        })

        if(flag){
            line_text += " O";
        }
        if(/[.]/i.test(d) && d.length == 1){
            line_text += "\n\n";
        }
        line_text += "\n";
        flag = true;
    })
    //console.log(line_text);
    fs.writeFile('./public/output/'+data.news_id+'.txt', line_text, function(err, data){
        if (err) console.log(err);
        console.log("Successfully Written to File.");
        return res.json({code: 200,msg:'Written Data Success!'})
    });
}