/*
 * @Description:
 * @Version: 1.0
 * @Author: 小国际
 * @Date: 2023-07-28 21:34:22
 * @LastEditors: 小国际
 * @LastEditTime: 2023-07-28 21:49:38
 */
const queue: any[] = [];
let isFlushPending: boolean = false;
export function queueJobs(job) {
	if (!queue.includes(job)) {
		queue.push(job);
	}
	//只用创建一次Promise。
	//第一次创建Promise后，将标识设为true，之后就不再创建了
	if (isFlushPending) return;
	isFlushPending = true;
	//执行所有的 job
	nextTick(flushJobs);
}

export function nextTick(fn) {
	return fn ? Promise.resolve().then(fn) : Promise.resolve();
}

function flushJobs() {
	let job;
	isFlushPending = false;
	while ((job = queue.shift())) {
		job && job();
	}
}
