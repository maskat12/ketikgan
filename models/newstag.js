'use strict';
module.exports = (sequelize, DataTypes) => {
  var NewsTag = sequelize.define('NewsTag', {
    newsId: DataTypes.INTEGER,
    origin: DataTypes.TEXT,
    newsArray: DataTypes.TEXT,
    tags: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
      },
      createNews: function(data){
        return this.findOne({where: {newsId: data.news_id}})
        .then((u) => {
          if(u) {
            u.origin = data.origin,
            u.newsArray = JSON.stringify(data.array_of_text),
            u.tags = JSON.stringify(data.out_tags)
            u.save();
          } else {
            u = this.create({
              newsId: data.news_id,
              origin: data.origin,
              newsArray:JSON.stringify(data.array_of_text),
              tags: JSON.stringify(data.out_tags)
            })
          }
        });
      },
      getAllNews: function (page=0){
        return this.findAll({
          offset: page,
          limit:10,
          order:'newsId ASC'
        }).then((result)=>{
          if (result) {
            return result.map(d => d.get({plain: true}))
          } else {
            return []
          }
        })
      },
      getNews: function (id){
        return this.findOne({where:{newsId:id}}).then((result) => {
          return result ? result.get({plain:true}):{} ;
      });
      },
      updateNews: function(id,data){
        this.findOne({where: {newsId: id}})
        .then((u) => {
          if(u) {
            u.origin = data.origin,
            u.newsArray = data.newsArray,
            u.tags = data.tags
            u.save();
          } else {
            u = this.create({
              origin: data.origin,
              newsArray: data.newsArray,
              tags: data.tags
            })
          }
          return next()
        });
      },
      

    }
  });
  return NewsTag;
};