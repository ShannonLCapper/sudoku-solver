require 'sinatra'
require './lib/sudoku-solver-sc.rb'
require 'json'
enable :sessions
set :session_secret, 'BADSECRET'

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
  session[:original] = nil
  erb :index
end

# get '/retry' do
#   original = session[:original]
#   erb :retry, :locals => {:original => original}
# end

# get '/solution' do
#   erb :none_submitted
# end

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
  # @original = Marshal.load(Marshal.dump(board))
  # @solution = solve_sudoku(board)
  # if @solution
  #   erb :solution
  # else
  #   session[:original] = @original
  #   erb :unsolvable
  # end

  response = { solution: solve_sudoku(board) }.to_json

end
