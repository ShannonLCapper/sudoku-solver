def solve_sudoku(board)
  return nil unless is_valid_sudoku(board)
  solve_sudoku_work(board)
  return is_valid_sudoku(board) ? board : nil
end

def solve_sudoku_work(board)
  empty_slots = true
  slot_changed = true
  while empty_slots
    if slot_changed
      empty_slots = false
      slot_changed = false
      board.each_with_index do |row, row_num|
        row.each_with_index do |slot, slot_num|
          next unless slot == "." || slot.is_a?(Array)
          empty_slots = true
          slot_options = find_possible_options(board, row_num, slot_num)
          return if slot_options.empty?
          #if theres only one number that could go in the slot
          if slot_options.length == 1
            row[slot_num] = slot_options.first
            slot_changed = true
          #if the current options are different than what was previously in the slot
          elsif slot_options != slot
            row[slot_num] = slot_options
            #check if any of the contained options are unique
            unique_option = find_unique_option_in_slot(board, slot_options, row_num, slot_num)
            row[slot_num] = unique_option unless unique_option.nil?
            slot_changed = true
          #check if any of the contained options are unique
          else
            unique_option = find_unique_option_in_slot(board, row[slot_num], row_num, slot_num)
            unless unique_option.nil?
              row[slot_num] = unique_option
              slot_changed = true
            end
          end
        end
      end
    else #start guessing
      unfilled_slots = find_all_unfilled_slots(board)
      return if unfilled_slots.empty? || unfilled_slots.nil?
      row_num_to_guess = unfilled_slots[0][:row_num]
      col_num_to_guess = unfilled_slots[0][:slot_num]
      possibilities = unfilled_slots[0][:possibilities]
      possibilities.each do |guess|
        fake_board = Marshal.load(Marshal.dump(board))
        fake_board[row_num_to_guess][col_num_to_guess] = guess
        solve_sudoku_work(fake_board)
        if is_valid_sudoku(fake_board)
          board.length.times { |i| board[i] = fake_board[i] }
          return #valid board found
        end
      end
      return #no valid boards found
    end
  end
end

def find_all_unfilled_slots(board)
  unfilled_slots = []
  board.each_with_index do |row, row_num|
    row.each_with_index do |slot, slot_num| 
      return nil if slot.is_a?(Array) && slot.empty?
      if slot.is_a?(Array)
        slot_info = {
          :length => slot.length, 
          :possibilities => slot, 
          :row_num => row_num, 
          :slot_num => slot_num
        }
        unfilled_slots << slot_info
      end
    end
  end
  unfilled_slots.sort_by! { |slot| slot[:length] } unless unfilled_slots.empty?
  return unfilled_slots
end

def find_possible_options(board, row_num, slot_num)
  possible_nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
  #delete nums in the same row
  board[row_num].each { |num| possible_nums.delete(num) }
  #delete nums in the same column
  board.each { |row| possible_nums.delete(row[slot_num]) }
  #find square
  row_range = find_range(row_num)
  column_range = find_range(slot_num)
  #delete nums in the same square
  board[row_range].each do |row|
    row[column_range].each { |num| possible_nums.delete(num) }
  end
  return possible_nums
end

def find_unique_option_in_slot(board, slot_options, row_num, slot_num)
  options = slot_options.dup
  board.each do |row|
    return nil if row.include?(".")
  end
  #check row
  board[row_num].each do |slot| 
    next unless slot.is_a?(Array)
    next if slot.equal?(board[row_num][slot_num])
    slot.each { |num| options.delete(num) }
  end
  #check column
  board.each do |row| 
    slot = row[slot_num]
    next unless slot.is_a?(Array)
    next if slot.equal?(board[row_num][slot_num])
    slot.each { |num| options.delete(num) }
  end
  # check square
  row_range = find_range(row_num)
  column_range = find_range(slot_num)
  board[row_range].each do |row|
    row[column_range].each do |slot|
      next unless slot.is_a?(Array)
      next if slot.equal?(board[row_num][slot_num])
      slot.each { |num| options.delete(num) }
    end
  end
  return options.first if options.length == 1
  return nil
end

def find_range(section_num)
  return (0..2) if section_num < 3
  return (3..5) if section_num < 6
  return (6..8)
end

def print_board(board)
  board.each { |row| puts "#{row}" }
end

def is_valid_sudoku(board)
  rows = Array.new(9, [])
  columns = Array.new(9, [])
  squares = Array.new(9, [])
  board.each_with_index do |row, row_number|
    find_range(row_number).to_a.each_with_index do |num, pos|
      range = if pos.zero?
        (0..2)
      elsif pos == 1
        (3..5)
      else
        (6..8)
      end
      squares[num] += row[range]
    end
    row.each_with_index do |slot, i|
      next if slot == "."
      columns[i] += [slot]
      rows[row_number] += [slot]
    end
  end
  squares.each { |square| square.delete(".") }
  rows.each { |row| return false if has_repeats?(row) }
  columns.each { |column| return false if has_repeats?(column) }
  squares.each { |square| return false if has_repeats? (square) }
  rows.each { |row| return false if has_non_string?(row)}
  return true
end

def has_repeats?(section)
  return section.length != section.uniq.length
end

def has_non_string?(row)
  row.each { |slot| return true unless slot.is_a?(String) }
  return false
end