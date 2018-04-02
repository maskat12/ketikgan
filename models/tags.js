'use strict';
module.exports = (sequelize, DataTypes) => {
  var Tags = sequelize.define('Tags', {
    name: DataTypes.STRING,
    prefix: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      },
      createTag: function(data){
        return this.create({
          name: data.name,
          prefix: data.prefix
        })
      },
      editTag: function(data){
        return this.update(
          {
            name: data.name,
            prefix: data.prefix
          },
          {
            where: {id:data.id}
          })
      },
      getAllTags: function(){
        return this.findAll({
        }).then((result)=>{
          if (result) {
            return result.map(d => d.get({plain: true}))
          } else {
            return []
          }
        })
      }
    }
  });
  return Tags;
};