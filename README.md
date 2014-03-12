Random Dungeon Generator
========================

A simple random dungeon generator made with javascript.

Usage
------

First of all create a `Dungeon` object:

`var dungeon = new Dungeon();`

Next you have to add the floors individually:

`dungeon.addFloor(29, 29);`

The `addFloor` function parameters are the floor `width`, the floor `height` and the floor layout `type` (this feature is not fully implemented yet). This will add a randomly generated floor to your dungeon.

You can add `n` floors using the following function:

`dungeon.addMultipleFloors(5, 13, 13);`

The first parameter is the number of floors. The rest are the same as the ones in `addFloor`.

A draw function is provided to show the result in a easy way:

`dungeon.draw(1, canvas);`

The functions parameters are the number `n` of the floor you want to draw and a `canvas` element where the layout will be drawn.

Each dungeon floor layout is compounded by cells and each of those cells have a different `type`. The possible cell types are:

* `EMPTY`: a empty cell. It contains... nothing.
* `BLOCKED`: special cells used to delimit dungeon's layout.
* `ROOM`: the cell is part of a room. Each room is composed by multiple cells.
* `PERIMETER`: the cell helps to delimit the boundaries of a room.
* `DOOR`: the cell is a door. A door can be interior (if it's located between rooms) or not.
* `CORRIDOR`: the cell is part of a corridor. The corridors connect different dungeon elements.
* `DEADEND`: the cell is a corridor dead end. A dead end can be a cool place to put a ladder or a treasure.
* `STAIRS`: this cell is a stair. You can't enter or leave a floor without one of these!

Examples
---------

White cells are the corridors and the rooms, the yellow cells are the doors and the red cells are the stairs.

Small:

![Boletarian prison](https://raw.github.com/jorgeprodriguez/random-dungeon-generator/master/examples/boletarian-prison.jpg)

Medium:

![The Dark Keep](https://raw.github.com/jorgeprodriguez/random-dungeon-generator/master/examples/the-dark-keep.jpg)

![Tower of Latria](https://raw.github.com/jorgeprodriguez/random-dungeon-generator/master/examples/tower-of-latria.jpg)

Big:

![Bottle Grotto](https://raw.github.com/jorgeprodriguez/random-dungeon-generator/master/examples/bottle-grotto.jpg)
