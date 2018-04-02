$(document).ready(function(){

    $('#edit-tags').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        var id = button.data('id')
        var name = button.data('name')
        var prefix = button.data('prefix')
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this)
        modal.find('#tag-name-modal').val(name);
        modal.find('#tag-prefix-modal').val(prefix);
        modal.find('#save-edit-tags').data({id:id});
    })

    $('#save-edit-tags').on('click',function(e){
        var id = $(this).data('id');
        var name = $('#tag-name-modal').val();
        var prefix = $('#tag-prefix-modal').val();
        $.ajax({
            type:'POST',
            url:'/tag/edit',
            data: JSON.stringify({
                id,
                name,
                prefix
            }),
            contentType: "application/json",
            success: function(data) {
                $('#edit-tags').modal('hide')
                displayTagsTable(data);
                $('#tag-input').val('');
                $('#tag-prefix').val('');
             }
        })
    })

    loadTags();

    function loadTags(){
            $.ajax({
                type:'GET',
                url:'api/tags',
                contentType: 'application/json',
                success: function(data) {
                    displayTagsTable(data);
        
                 }
            })
    }

    $("#add-tag").on('submit', function() {
        var data = $('#tag-input').val();
        var prefix = $('#tag-prefix').val();
        $.ajax({
            type:'POST',
            url:'/tag/add',
            data: JSON.stringify({
                name: data,
                prefix
            }),
            contentType: "application/json",
            success: function(data) {
                displayTagsTable(data);
                $('#tag-input').val('');
                $('#tag-prefix').val('');
             }
        })
        
    });

    function displayTagsTable(data){
        $(".display-tags").html(
            '<thead><tr><th>ID</th><th>Tag</th><th>Prefix</th><th>Action</th></tr></thead><tbody>'+
            data.map(function(d,i){
                return '<tr><td>'+(d.id)+'</td><td>'+ d.name +'</td><td>'+ d.prefix +'</td><td><button id="edit-tags-btn" data-id="'+d.id+'" data-name="'+d.name+'" data-prefix="'+d.prefix+'" data-toggle="modal" data-target="#edit-tags" class="btn btn-secondary">Edit</button></td></tr>';
            })
            +"</tbody>"
        )
    }
});