  <div class="container-fluid">
    <div class="container">
      <footer class="footer">
        <div class="row">
          <div class="col-xs-12">
            <p>&copy; <?php bloginfo('name'); ?> <?php echo date('Y'); ?></p>
          </div>
        </div>
      </footer>
    </div>
 </div> <!-- /container -->

    <?php wp_footer(); ?>
    <?php if(is_front_page()) { ?>
     <script src='http://pipewatch.org/wp-content/uploads/2015/08/bootstrap-slider1.js'></script>
     <script src='http://pipewatch.org/wp-content/themes/glwparent-child/js/pipewatch.js'></script>
    <?php } ?>
    <script>
        $('.sidebar-links button').on('click', function(e) {
            e.preventDefault();
            var $this = $(this);
            var $collapse = $('.collapse-group').find('.collapse.in');
            $collapse.collapse('toggle');
        });
    </script>
</html>