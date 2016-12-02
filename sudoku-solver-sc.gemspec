# coding: utf-8
lib = File.extend_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

Gem::Specification.new do |spec|
	spec.name			= "sudoku-solver-sc"
	spec.version		= '1.0'
	spec.authors		= ["Shannon Capper"]
	spec.email			= ["ShannonLCapper@gmail.com"]
	spec.summary		= %q{Web app to solve sudoku puzzles}
	spec.description	= %q{This web app solves any sudoku puzzle. Just input the tiles you know, and it does the rest}
	spec.homepage		= "http://domainforproject.com/"
	spec.license		= "MIT"

	spec.files			= Dir["{lib}/**/*.rb", "{lib}/**/*.txt", "bin/*", "LICENSE", "*.md"]
	spec.executables	= ['sudoku-solver-sc']
	spec.test_files		= Dir["{tests}/**/*.rb"]
	spec.require_paths	= ["lib"]
end