const Job = require('../models/Job')
const Profile = require('../models/Profile')
const JobUtils = require('../utils/JobUtils')

module.exports = {
  index (req, res) {
    const jobs = Job.get()
    const profile = Profile.get()

    const updatedJobs = jobs.map(job => {
      const remaining = JobUtils.remainingDays(job)
      const status = remaining <= 0 ? 'done' : 'progress'
      const budget = JobUtils.calcBudget(job, profile["value-hour"])
  
      return {
        ...job,
        remaining,
        status,
        budget
      }
    })
  
    return res.render('index', { jobs: updatedJobs, profile: profile })
  },

  post (req, res) {
    const jobs = Job.get()
    const lastId = jobs.length === 0 ? 1 : jobs.length+1

    const job = {
      id: lastId,
      name: req.body.name,
      'daily-hours': req.body['daily-hours'],
      'total-hours': req.body['total-hours'],
      created_at: Date.now()
    }
  
    jobs.push(job)

    return res.redirect('/')
  },

  create (req, res) {
    return res.render('job')
  },

  editPage(req, res) {
    const jobs = Job.get()
    const profile = Profile.get()

    const jobId = req.params.id

    const obj = jobs.find(job => job.id == jobId)

    if(!obj) 
      res.send('Job not found!')
    
    obj.budget = JobUtils.calcBudget(obj, profile["value-hour"])
    
    return res.render('job-edit', { job: obj })
  },

  update(req, res) {
    const jobs = Job.get()
    const jobId = req.params.id

    const obj = jobs.find(job => job.id == jobId)

    if(!obj) 
      res.send('Job not found!')
    
    const updatedJob = {
      ...obj,
      name: req.body.name,
      "total-hours": req.body["total-hours"],
      "daily-hours": req.body["daily-hours"]
    }

    const newJobs = jobs.map(job => {
      if(Number(job.id) === Number(jobId))
        job = updatedJob

      return job
    })

    Job.set(newJobs)

    res.redirect('/')
  },

  delete(req, res) {
    const jobs = Job.get()
    const jobId = req.params.id

    const jobsFiltered = jobs.filter(job => Number(job.id) !== Number(jobId))

    Job.set(jobsFiltered)

    return res.redirect('/')
  }
}