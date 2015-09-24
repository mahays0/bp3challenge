/* test data has:
- 681 open tasks
- 629 closed tasks
- first create date: 2014-10-06T23:32:23Z
- last create date: 2015-02-24T00:32:38Z
- first closed date: 2014-10-08T23:32:31Z
- last closed date: 2015-02-24T00:32:38Z
- two assignees: Impact 2014 and dbailie
*/
var test_tasks = require('./task.json')

/*
Two tasks for rosie. Start date of open task is after close date of another.
*/
var rosie_tasks = require('./rosie_tasks.json');

var challenge_apis = require('./challenge.js');

function assertEquals(expected, result){
	if(expected==result){
		console.log(".");
	}else{
		var error = new Error("Failure: expected "+expected+", got: "+result);
		console.error(error.stack);
	}
}

function test_getOpenAndClosedTasks(){
	// t=last date: all 52 currently open tasks and 629 closed tasks should be present
	var expected=JSON.stringify({open:52, closed:629});
	var result = JSON.stringify(challenge_apis.getOpenAndClosedTasks(test_tasks, "2015-02-24T00:32:38Z"));
	assertEquals(expected, result);

	// test t-1 per proper boundary value analysis (1 less closed)
	expected=JSON.stringify({open:52, closed:628});
	result = JSON.stringify(challenge_apis.getOpenAndClosedTasks(test_tasks, "2015-02-24T00:32:37Z"));
	assertEquals(expected, result);

	// test t=first date: three open tasks present at that time
	expected=JSON.stringify({open:3, closed:0});
	result = JSON.stringify(challenge_apis.getOpenAndClosedTasks(test_tasks, "2014-10-06T23:32:23Z"));
	assertEquals(expected, result);

	// t-1: 0 tasks
	expected=JSON.stringify({open:0, closed:0});
	result = JSON.stringify(challenge_apis.getOpenAndClosedTasks(test_tasks, "2014-10-06T23:32:22Z"));
	assertEquals(expected, result);

	// t+1 is the same as t in this case, so no t+1 test	
}


function test_getOpenedAndClosedTasksInRange(){
	// t1=first date (inclusive), t2=last date (exclusive): one task was opened on the last date and one was closed, so two should be missing.
	var expected=JSON.stringify({opened:680, closed:628});
	var result = JSON.stringify(challenge_apis.getOpenedAndClosedTasksInRange(test_tasks, "2014-10-06T23:32:23Z", "2015-02-24T00:32:38Z"));
	assertEquals(expected, result);

	// t2+1: all tasks
	expected=JSON.stringify({opened:681, closed:629});
	result = JSON.stringify(challenge_apis.getOpenedAndClosedTasksInRange(test_tasks, "2014-10-06T23:32:23Z", "2015-02-24T00:32:39Z"));
	assertEquals(expected, result);


	// t1+1: 3 open tasks missing vs t1
	expected=JSON.stringify({opened:677, closed:628});
	result = JSON.stringify(challenge_apis.getOpenedAndClosedTasksInRange(test_tasks, "2014-10-06T23:32:24Z", "2015-02-24T00:32:38Z"));
	assertEquals(expected, result);

	// t1-1 is the same as t1 in this case, so no t1-1 test


	// t1=t2: no tasks because end range is excluded
	expected=JSON.stringify({opened:0, closed:0});
	result = JSON.stringify(challenge_apis.getOpenedAndClosedTasksInRange(test_tasks, "2015-02-17T00:32:38Z", "2015-02-17T00:32:38Z"));
	assertEquals(expected, result);

	// t2=t1+1: one task
	expected=JSON.stringify({opened:0, closed:1});
	result = JSON.stringify(challenge_apis.getOpenedAndClosedTasksInRange(test_tasks, "2015-02-17T00:32:38Z", "2015-02-17T00:32:39Z"));
	assertEquals(expected, result);
}

function test_getMostRecentTaskNameByInstanceId(){
	// instance with no tasks
	var expected=null;
	var result = challenge_apis.getMostRecentTaskNameByInstanceId(test_tasks, -1);
	assertEquals(expected, result);

	// instance with several tasks with the recent one having a different name than the rest
	var expected="Create Client On-Boarding Request";
	var result = challenge_apis.getMostRecentTaskNameByInstanceId(test_tasks, 489);
	assertEquals(expected, result);

	// instance with several tasks with the oldest one having a different name than the rest
	var expected="Review Client On-Boarding Request";
	var result = challenge_apis.getMostRecentTaskNameByInstanceId(test_tasks, 680);
	assertEquals(expected, result);
}

function test_countTasksByInstanceId(){
	// instance with no tasks
	var expected=0;
	var result = challenge_apis.countTasksByInstanceId(test_tasks, -1);
	assertEquals(expected, result);

	// instance with several tasks
	var expected=5;
	var result = challenge_apis.countTasksByInstanceId(test_tasks, 680);
	assertEquals(expected, result);
}

function test_countTasksByAssignee(){
	// assignee with no tasks (YET)
	var expected=JSON.stringify({open:0, closed:0});
	var result = JSON.stringify(challenge_apis.countTasksByAssignee(test_tasks, "hays"));
	assertEquals(expected, result);

	// Impact 2014 with 663 tasks, 52 null close dates
	var expected=JSON.stringify({open:52, closed:611});
	var result = JSON.stringify(challenge_apis.countTasksByAssignee(test_tasks, "Impact 2014"));
	assertEquals(expected, result);

	// dbailie with 18 closed tasks and no null close dates
	var expected=JSON.stringify({open:0, closed:18});
	var result = JSON.stringify(challenge_apis.countTasksByAssignee(test_tasks, "dbailie"));
	assertEquals(expected, result);

	// rosie with open task opened more recently than closed task
	var expected=JSON.stringify({open:1, closed:1});
	var result = JSON.stringify(challenge_apis.countTasksByAssignee(rosie_tasks, "rosie"));
	assertEquals(expected, result);
}

test_getOpenAndClosedTasks();
test_getOpenedAndClosedTasksInRange();
test_getMostRecentTaskNameByInstanceId();
test_countTasksByInstanceId();
test_countTasksByAssignee();
