exports.getOpenAndClosedTasks=function(tasks, date){
	// Given a specific date, return the current number of open and closed tasks. The date is inclusive so if we ask for midnight Oct 12, a task opened or closed on midnight would count
	var result = {open: 0, closed: 0};
	for(var i=0; i<tasks.length; i++){
		var task = tasks[i];
		var createDate=task.createDate;
		if(createDate>date) continue;
		var closeDate = task.closeDate;
		if(closeDate){
			if(closeDate>date){
				result['open']++;
			}else{
				result['closed']++;
			}
		}else{
			result['open']++;
		}
	}
	return result;
}

exports.getOpenedAndClosedTasksInRange=function(tasks, startDate, endDate){
	// Given a specific start and end date, return how many tasks were opened and how many were closed in that range. The start date is inclusive, the end date is exclusive.
	// A range of the form [startDate,startDate) is defined to be empty.
	var result = {opened: 0, closed: 0};
	if(endDate<=startDate) return result;
	for(var i=0; i<tasks.length; i++){
		var task = tasks[i];
		var createDate=task.createDate;
		if(createDate>=endDate) continue;
		if(createDate>=startDate){
			result['opened']++;
		}
		var closeDate = task.closeDate;
		if(closeDate && closeDate < endDate && closeDate >= startDate){
			result['closed']++;
		}
	}
	return result;
}

function queryTasks(tasks, field, value){
	var newTasks=[];
	for(var i=0; i<tasks.length; i++){
		if(tasks[i][field]==value){
			newTasks.push(tasks[i]);
		}
	}
	return newTasks;
}

function queryMostRecentTask(tasks, dateField){
	if(tasks.length==0){
		return null;
	}
	var maxIndex=0;
	for(var i=0; i<tasks.length; i++){
		// when searching for closed tasks, don't count open tasks as having the most recent closed date
		if(tasks[i][dateField]!=null && tasks[maxIndex][dateField]<tasks[i][dateField]){
			maxIndex=i;
		}
	}
	return tasks[maxIndex];
}

exports.getMostRecentTaskNameByInstanceId=function(tasks, instanceId){
	// Given a particular instanceId, return the name of the most recent task.
	var instanceTasks=queryTasks(tasks, 'instanceId', instanceId);
	var task=queryMostRecentTask(instanceTasks, 'createDate');
	if(task){
		return task.name;
	}else{
		return null;
	}
}

exports.countTasksByInstanceId=function(tasks, instanceId){
	// Given a particular instanceId, return the count of tasks.
	return queryTasks(tasks, 'instanceId', instanceId).length;
}

exports.countTasksByAssignee=function(tasks, assignee){
	// Given a particular assignee, return the count of open and closed tasks for that assignee.
	var assignedTasks=queryTasks(tasks, 'assignee', assignee);
	if(assignedTasks.length==0){
		return {open: 0, closed: 0};
	}
	var lastOpened = queryMostRecentTask(assignedTasks, 'createDate').createDate;
	var lastClosed = queryMostRecentTask(assignedTasks, 'closeDate').closeDate;
	var date=lastOpened>lastClosed?lastOpened:lastClosed;  // closeDate can be null, but lastOpened>null is always true so we'll get a non-null date
	return exports.getOpenAndClosedTasks(assignedTasks, date);
}
