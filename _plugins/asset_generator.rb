require 'rubygems'
require 'closure-compiler'
require 'sass'

module Jekyll
  # Generate assets in assets directory
  class AssetGenerator < Generator
    class Asset
      attr_reader :path

      def initialize(source_path, destination_path)
        @source_path = source_path
        @destination_path = destination_path
        @file = File.open(@source_path)
        @contents = @file.read
        @file.close
      end

      def minify?
        ! (filename =~ /^_/)
      end

      def relative_path
        @source_path.gsub(filename, "")
      end

      def contents
        @contents
      end

      def extension
        File.extname(@source_path)
      end

      def filename
        @source_path.split("/").last
      end

      def minified_filename
        filename.gsub(/\.#{extension}$/, minified_extension)
      end

      def minified_path
        @destination_path.gsub(/\.#{extension}$/, minified_extension)
      end

      def minified_extension
        if extension == ".js"
          ".min.js"
        elsif extension == ".sass"
          ".css"
        else
          raise NotImplementedError, "Unknown extension #{extension}"
        end
      end
    end

    def generate(site)
      javascripts(site).each do |asset|
        if asset.minify?
          contents = asset.contents
          contents.gsub!(/\@import \"?([^\"\n]+)\"?/) do |match|
            path = $1
            File.read(asset.relative_path + path)
          end
          minified = Closure::Compiler.new.compile(StringIO.new(contents))

          File.open(asset.minified_path, 'w') do |file|
            file << minified
          end
          site.static_files << Jekyll::StaticFile.new(site, site.dest, asset.directory, asset.minfied_filename)
        end
      end

      # stylesheets.each do |stylesheet|
      # end
    end

    private

    def source_asset_directory(site)
      site.source + "/assets"
    end

    def destination_assset_directory(site)
      site.dest + "/assets"
    end

    def javascripts(site)
      Dir[source_asset_directory(site) + "/**/*.js"].collect do |source_path|
        destination_path = source_path.gsub(source_asset_directory(site), destination_assset_directory(site))
        Asset.new(source_path, destination_path)
      end
    end

    def stylesheets(site)
      Dir[source_asset_directory(site) + "/**/*.sass"].collect do |source_path|
        destination_path = source_path.gsub(source_asset_directory(site), destination_assset_directory(site))
        Asset.new(source_path, destination_path)
      end
    end
  end
end