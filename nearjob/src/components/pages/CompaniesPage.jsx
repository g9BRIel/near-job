import { useState, useEffect } from 'react';
import CompanyCard from '../cards/CompanyCard';
import { companyDistribution } from '../../data/mockData';
import { API_BASE, normalizeCompany, authHeaders } from '../../utils/api';

const CompaniesPage = ({ onViewCompanyJobs, onContactCompany }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const [compRes, jobsRes] = await Promise.all([
          fetch(`${API_BASE}/api/users?userType=company`, { headers: authHeaders() }),
          fetch(`${API_BASE}/api/jobs`, { headers: authHeaders() }),
        ]);
        const rawCompanies = await compRes.json();
        const rawJobs = await jobsRes.json();

        const jobsList = rawJobs.data || rawJobs || [];
        const companiesList = rawCompanies.data || rawCompanies || [];

        const counts = {};
        (Array.isArray(jobsList) ? jobsList : []).forEach((j) => {
          const cid = j.companyId;
          if (cid == null) return;
          counts[cid] = (counts[cid] || 0) + 1;
        });

        const list = (Array.isArray(companiesList) ? companiesList : []).map((c) =>
          normalizeCompany({ ...c, openJobs: counts[c.id] ?? 0 })
        );
        setCompanies(list);
      } catch (err) {
        console.error(err);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {loading ? (
          <p className="text-white col-span-full">Loading companies…</p>
        ) : companies.length === 0 ? (
          <p className="text-gray-400 col-span-full">No companies found.</p>
        ) : (
          companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onViewJobs={onViewCompanyJobs ? () => onViewCompanyJobs(company) : undefined}
              onContact={onContactCompany ? () => onContactCompany(company) : undefined}
            />
          ))
        )}
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Company Distribution</h3>
        <p className="text-gray-500 text-sm mb-4">Illustrative mix — swap for real analytics when you wire a reporting API.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {companyDistribution.map((item, i) => (
            <div key={i} className={`p-6 rounded-xl bg-gradient-to-br ${item.color} text-white`}>
              <h4 className="text-3xl font-bold mb-2">{item.count}</h4>
              <p className="text-white/80">{item.industry} Companies</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompaniesPage;
