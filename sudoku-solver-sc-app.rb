require 'sinatra'
require './lib/sudoku-solver-sc.rb'
require 'json'

Template = [
  [".", ".", ".", ".", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", ".", ".", ".", "."],
  [".", ".", ".", ".", ".", ".", ".", ".", "."]
]

get '/' do
  erb :index
end

post '/solution' do
  board = Marshal.load(Marshal.dump(Template))
  params.each do |id, val|
    id = id.to_s
    row = id[0].to_i
    column = id[-1].to_i
    if val == ""
      board[row][column] = "."
    else
      board[row][column] = val
    end
  end

  response = { solution: solve_sudoku(board) }.to_json

end
